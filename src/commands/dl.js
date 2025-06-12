const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Função de espera
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para tentar upload com retry
async function uploadWithRetry(fileBuffer, filename, maxRetries = 3, initialDelay = 1000) {
    let lastError;
    const uploadUrl = 'https://autumn.revolt.chat/attachments';

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // Criar novo FormData para cada tentativa
            const form = new FormData();
            form.append('file', fileBuffer, {
                filename: filename,
                contentType: 'application/octet-stream'
            });

            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: form
            });

            if (response.ok) {
                return await response.json();
            }

            throw new Error(`Upload failed with status ${response.status}`);
        } catch (error) {
            console.error(`Tentativa ${attempt + 1} falhou:`, error.message);
            lastError = error;
            if (attempt < maxRetries - 1) {
                console.log(`Aguardando ${initialDelay * Math.pow(2, attempt)}ms antes da próxima tentativa...`);
                await wait(initialDelay * Math.pow(2, attempt));
            }
        }
    }
    throw lastError;
}

// Função para dividir arquivo em partes menores
async function splitFile(filePath, maxSizeMB = 7) {
    const stats = fs.statSync(filePath);
    const maxSize = maxSizeMB * 1024 * 1024; // Converter para bytes
    
    if (stats.size <= maxSize) {
        return [filePath]; // Retorna o arquivo original se for menor que o tamanho máximo
    }

    const ext = path.extname(filePath);
    const baseDir = path.dirname(filePath);
    const baseName = path.basename(filePath, ext);
    const parts = [];
    
    // Usar FFmpeg para dividir o vídeo em partes menores
    const duration = await new Promise((resolve, reject) => {
        exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, 
            (error, stdout) => {
                if (error) reject(error);
                else resolve(parseFloat(stdout));
            });
    });

    const numParts = Math.ceil(stats.size / maxSize);
    const segmentDuration = duration / numParts;

    for (let i = 0; i < numParts; i++) {
        const outputPath = path.join(baseDir, `${baseName}_part${i + 1}${ext}`);
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i "${filePath}" -ss ${i * segmentDuration} -t ${segmentDuration} -c copy "${outputPath}"`,
                (error) => {
                    if (error) reject(error);
                    else resolve();
                });
        });
        parts.push(outputPath);
    }

    return parts;
}

module.exports = {
    name: 'dl',
    description: 'Baixa mídia de várias plataformas (TikTok, Instagram, etc)',
    category: 'Mídia',
    cooldown: 5,
    async execute(message, args, client) {
        let downloadedFile = null;
        let splitFiles = [];

        try {
            if (!args.length) {
                await client.sendMessage(message.channel, {
                    content: '❌ Por favor, forneça um link! Exemplo: !dl https://www.tiktok.com/...'
                });
                return;
            }

            const url = args[0];
            const downloadDir = path.join(__dirname, '../../downloads');
            const cookiesFile = path.join(__dirname, '../../config/cookies.txt');

            // Criar diretório de downloads se não existir
            if (!fs.existsSync(downloadDir)) {
                fs.mkdirSync(downloadDir, { recursive: true });
            }

            const statusMessage = await client.sendMessage(message.channel, {
                content: '⏳ Baixando mídia, aguarde...'
            });

            // Usar yt-dlp para baixar o conteúdo
            const outputTemplate = path.join(downloadDir, '%(title)s.%(ext)s');
            
            // Usar arquivo de cookies
            const command = `yt-dlp "${url}" -o "${outputTemplate}" --no-playlist --max-filesize 25m --cookies ${cookiesFile}`;

            exec(command, async (error, stdout, stderr) => {
                if (error) {
                    console.error('Erro ao baixar:', error);
                    
                    // Se for erro de autenticação do TikTok
                    if (error.message.includes('Video is private') || error.message.includes('Login required')) {
                        await client.sendMessage(message.channel, {
                            content: '🔒 Para baixar este vídeo, você precisa adicionar os cookies do TikTok. Siga os passos:\n\n' +
                                '1. Faça login no TikTok pelo navegador\n' +
                                '2. Use o comando `!cookies <cookies>` com os cookies do TikTok\n' +
                                '3. Tente baixar o vídeo novamente'
                        });
                        return;
                    }

                    await client.sendMessage(message.channel, {
                        content: `❌ Não foi possível baixar a mídia: ${error.message}`
                    });
                    return;
                }

                try {
                    // Encontrar o arquivo baixado mais recente
                    const files = fs.readdirSync(downloadDir);
                    const latestFile = files
                        .map(file => ({
                            name: file,
                            time: fs.statSync(path.join(downloadDir, file)).mtime.getTime()
                        }))
                        .sort((a, b) => b.time - a.time)[0];

                    if (!latestFile) {
                        await client.sendMessage(message.channel, {
                            content: '❌ Não foi possível encontrar o arquivo baixado.'
                        });
                        return;
                    }

                    downloadedFile = path.join(downloadDir, latestFile.name);
                    console.log('Arquivo baixado:', downloadedFile);

                    // Dividir o arquivo se necessário
                    splitFiles = await splitFile(downloadedFile);
                    console.log(`Arquivo dividido em ${splitFiles.length} partes`);

                    // Enviar cada parte
                    for (let i = 0; i < splitFiles.length; i++) {
                        const partFile = splitFiles[i];
                        const partBuffer = fs.readFileSync(partFile);
                        const partName = path.basename(partFile);

                        try {
                            // Tentar upload com retry
                            const uploadResult = await uploadWithRetry(partBuffer, partName);
                            console.log(`Parte ${i + 1}/${splitFiles.length} enviada com sucesso`);

                            // Enviar a mensagem com o arquivo anexado
                            await client.sendMessage(message.channel, {
                                content: splitFiles.length > 1 ? `📤 Parte ${i + 1}/${splitFiles.length}` : '',
                                attachments: [uploadResult.id]
                            });
                        } catch (uploadError) {
                            console.error(`Erro no upload da parte ${i + 1}:`, uploadError);
                            
                            // Tentar método alternativo
                            console.log('Tentando método alternativo de upload...');
                            
                            try {
                                await client.sendMessage(message.channel, {
                                    content: splitFiles.length > 1 ? `📤 Parte ${i + 1}/${splitFiles.length}` : '',
                                    attachments: [{
                                        name: partName,
                                        data: partBuffer,
                                        file: partBuffer
                                    }]
                                });
                            } catch (alternativeError) {
                                console.error('Erro no método alternativo:', alternativeError);
                                throw alternativeError;
                            }
                        }

                        // Pequena pausa entre uploads
                        if (i < splitFiles.length - 1) {
                            await wait(1000);
                        }
                    }

                    // Mensagem de sucesso final
                    await client.sendMessage(message.channel, {
                        content: `✅ Mídia ${splitFiles.length > 1 ? '(todas as partes)' : ''} enviada com sucesso!`
                    });

                } catch (error) {
                    console.error('Erro ao processar arquivo:', error);
                    await client.sendMessage(message.channel, {
                        content: `❌ Erro ao processar arquivo: ${error.message}`
                    });
                } finally {
                    // Limpar arquivos temporários
                    if (downloadedFile && fs.existsSync(downloadedFile)) {
                        fs.unlinkSync(downloadedFile);
                        console.log('Arquivo original removido:', downloadedFile);
                    }
                    
                    // Limpar partes divididas
                    for (const partFile of splitFiles) {
                        if (fs.existsSync(partFile)) {
                            fs.unlinkSync(partFile);
                            console.log('Arquivo parte removido:', partFile);
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Erro no comando dl:', error);
            await client.sendMessage(message.channel, {
                content: `❌ Ocorreu um erro: ${error.message}`
            });
        }
    }
}; 