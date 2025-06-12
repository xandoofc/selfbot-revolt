const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'cookies',
    description: 'Configura os cookies para download de vídeos do TikTok',
    category: 'Configuração',
    cooldown: 5,
    async execute(message, args, client) {
        try {
            if (!args.length) {
                await client.sendMessage(message.channel, {
                    content: '🍪 Como usar os cookies:\n\n' +
                        '1. Acesse TikTok.com e faça login\n' +
                        '2. Pressione F12 para abrir as ferramentas do desenvolvedor\n' +
                        '3. Vá na aba "Network"\n' +
                        '4. Procure por qualquer requisição para "tiktok.com"\n' +
                        '5. Na aba "Headers", procure por "cookie" nos cabeçalhos da requisição\n' +
                        '6. Copie todo o valor do cookie\n' +
                        '7. Use o comando: !cookies seu_cookie_aqui'
                });
                return;
            }

            const cookiesDir = path.join(__dirname, '../../config');
            const cookiesFile = path.join(cookiesDir, 'cookies.txt');
            const cookieContent = args.join(' ');

            // Criar diretório se não existir
            if (!fs.existsSync(cookiesDir)) {
                fs.mkdirSync(cookiesDir, { recursive: true });
            }

            // Formatar cookies para o formato Netscape
            const formattedCookies = cookieContent.split(';')
                .map(cookie => {
                    const [name, value] = cookie.trim().split('=');
                    return `.tiktok.com\tTRUE\t/\tTRUE\t${Math.floor(Date.now() / 1000) + 31536000}\t${name}\t${value}`;
                })
                .join('\n');

            // Salvar cookies
            fs.writeFileSync(cookiesFile, '# Netscape HTTP Cookie File\n' + formattedCookies);

            await client.sendMessage(message.channel, {
                content: '✅ Cookies do TikTok foram salvos com sucesso!\n\nAgora você pode usar o comando !dl para baixar vídeos.'
            });

        } catch (error) {
            console.error('Erro no comando cookies:', error);
            await client.sendMessage(message.channel, {
                content: `❌ Ocorreu um erro ao salvar os cookies: ${error.message}`
            });
        }
    }
}; 