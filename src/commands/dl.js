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

                await message.reply(formatter.toJSON());
                return;
            }

            const url = args[0];
            const downloadDir = path.join(__dirname, '../../downloads');

            // Criar diretório de downloads se não existir
            if (!fs.existsSync(downloadDir)) {
                fs.mkdirSync(downloadDir, { recursive: true });
            }

            const formatter = new MessageFormatter()
                .setTitle('Download')
                .setDescription('⏳ Baixando mídia, aguarde...')
                .setTimestamp();

            const statusMessage = await message.reply(formatter.toJSON());

            // Usar yt-dlp para baixar o conteúdo
            const outputTemplate = path.join(downloadDir, '%(title)s.%(ext)s');
            
            // Adiciona cookies do Chrome para TikTok
            const command = `yt-dlp "${url}" -o "${outputTemplate}" --no-playlist --max-filesize 25m --cookies-from-browser chrome`;

            exec(command, async (error, stdout, stderr) => {
                if (error) {
                    console.error('Erro ao baixar:', error);
                    const errorFormatter = new MessageFormatter()
                        .setTitle('Erro')
                        .setDescription(`Não foi possível baixar a mídia: ${error.message}`)
                        .setTimestamp();

                    await message.reply(errorFormatter.toJSON());
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

                    await message.reply(errorFormatter.toJSON());
                    return;
                }

                const filePath = path.join(downloadDir, latestFile.name);

                try {
                    // Enviar o arquivo
                    await message.channel.sendFile(filePath);

                    // Atualizar mensagem de status
                    const successFormatter = new MessageFormatter()
                        .setTitle('Download Concluído')
                        .setDescription('✅ Mídia baixada e enviada com sucesso!')
                        .setTimestamp();

                    await message.reply(successFormatter.toJSON());

                    // Limpar o arquivo após o envio
                    fs.unlinkSync(filePath);
                } catch (uploadError) {
                    console.error('Erro ao enviar arquivo:', uploadError);
                    const errorFormatter = new MessageFormatter()
                        .setTitle('Erro')
                        .setDescription(`Erro ao enviar arquivo: ${uploadError.message}`)
                        .setTimestamp();

                    await message.reply(errorFormatter.toJSON());
                }
            });
        } catch (error) {
            console.error('Erro no comando dl:', error);
            const formatter = new MessageFormatter()
                .setTitle('Erro')
                .setDescription(`Ocorreu um erro: ${error.message}`)
                .setTimestamp();

            await message.reply(formatter.toJSON());
        }
    }
}; 