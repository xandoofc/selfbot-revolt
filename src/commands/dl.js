const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const MessageFormatter = require('../utils/MessageEmbed');

module.exports = {
    name: 'dl',
    description: 'Baixa mídia de várias plataformas (TikTok, Instagram, etc)',
    category: 'Mídia',
    cooldown: 5,
    async execute(message, args, client) {
        try {
            if (!args.length) {
                const formatter = new MessageFormatter()
                    .setTitle('Erro')
                    .setDescription('Por favor, forneça um link! Exemplo: !dl https://www.tiktok.com/...')
                    .setTimestamp();

                await client.sendMessage(message.channel, formatter.toJSON());
                return;
            }

            const url = args[0];
            const downloadDir = path.join(__dirname, '../../downloads');
            const cookiesFile = path.join(__dirname, '../../config/cookies.txt');

            // Criar diretório de downloads se não existir
            if (!fs.existsSync(downloadDir)) {
                fs.mkdirSync(downloadDir, { recursive: true });
            }

            const formatter = new MessageFormatter()
                .setTitle('Download')
                .setDescription('⏳ Baixando mídia, aguarde...')
                .setTimestamp();

            const statusMessage = await client.sendMessage(message.channel, formatter.toJSON());

            // Usar yt-dlp para baixar o conteúdo
            const outputTemplate = path.join(downloadDir, '%(title)s.%(ext)s');
            
            // Usar arquivo de cookies
            const command = `yt-dlp "${url}" -o "${outputTemplate}" --no-playlist --max-filesize 25m --cookies ${cookiesFile}`;

            exec(command, async (error, stdout, stderr) => {
                if (error) {
                    console.error('Erro ao baixar:', error);
                    
                    // Se for erro de autenticação do TikTok
                    if (error.message.includes('Video is private') || error.message.includes('Login required')) {
                        const helpFormatter = new MessageFormatter()
                            .setTitle('Erro de Autenticação')
                            .setDescription('Para baixar este vídeo, você precisa adicionar os cookies do TikTok. Siga os passos:\n\n' +
                                '1. Faça login no TikTok pelo navegador\n' +
                                '2. Use o comando `!cookies <cookies>` com os cookies do TikTok\n' +
                                '3. Tente baixar o vídeo novamente')
                            .setTimestamp();

                        await client.sendMessage(message.channel, helpFormatter.toJSON());
                        return;
                    }

                    const errorFormatter = new MessageFormatter()
                        .setTitle('Erro')
                        .setDescription(`Não foi possível baixar a mídia: ${error.message}`)
                        .setTimestamp();

                    await client.sendMessage(message.channel, errorFormatter.toJSON());
                    return;
                }

                // Encontrar o arquivo baixado mais recente
                const files = fs.readdirSync(downloadDir);
                const latestFile = files
                    .map(file => ({
                        name: file,
                        time: fs.statSync(path.join(downloadDir, file)).mtime.getTime()
                    }))
                    .sort((a, b) => b.time - a.time)[0];

                if (!latestFile) {
                    const errorFormatter = new MessageFormatter()
                        .setTitle('Erro')
                        .setDescription('Não foi possível encontrar o arquivo baixado.')
                        .setTimestamp();

                    await client.sendMessage(message.channel, errorFormatter.toJSON());
                    return;
                }

                const filePath = path.join(downloadDir, latestFile.name);

                try {
                    // Enviar o arquivo
                    await client.uploadFile(message.channel, filePath);

                    // Atualizar mensagem de status
                    const successFormatter = new MessageFormatter()
                        .setTitle('Download Concluído')
                        .setDescription('✅ Mídia baixada e enviada com sucesso!')
                        .setTimestamp();

                    await client.sendMessage(message.channel, successFormatter.toJSON());

                    // Limpar o arquivo após o envio
                    fs.unlinkSync(filePath);
                } catch (uploadError) {
                    console.error('Erro ao enviar arquivo:', uploadError);
                    const errorFormatter = new MessageFormatter()
                        .setTitle('Erro')
                        .setDescription(`Erro ao enviar arquivo: ${uploadError.message}`)
                        .setTimestamp();

                    await client.sendMessage(message.channel, errorFormatter.toJSON());
                }
            });
        } catch (error) {
            console.error('Erro no comando dl:', error);
            const formatter = new MessageFormatter()
                .setTitle('Erro')
                .setDescription(`Ocorreu um erro: ${error.message}`)
                .setTimestamp();

            await client.sendMessage(message.channel, formatter.toJSON());
        }
    }
}; 