const fs = require('fs');
const path = require('path');
const sendEmbed = require('../utils/sendEmbed');

module.exports = {
    name: 'help',
    description: 'Lista todos os comandos disponíveis',
    category: 'Informação',
    cooldown: 5,
    async execute(message, args, client) {
        try {
            // Verificar se o canal existe
            if (!message.channel) {
                console.error('Canal não encontrado na mensagem:', message);
                return;
            }

            const commands = [];
            const commandFiles = fs.readdirSync(path.join(__dirname)).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const command = require(`./${file}`);
                commands.push({
                    name: command.name,
                    description: command.description,
                    category: command.category || 'Sem categoria'
                });
            }

            // Agrupar comandos por categoria
            const categories = {};
            commands.forEach(cmd => {
                if (!categories[cmd.category]) {
                    categories[cmd.category] = [];
                }
                categories[cmd.category].push(cmd);
            });

            // Criar mensagem de ajuda
            const description = [
                '# 📚 Lista de Comandos',
                'Aqui estão todos os comandos disponíveis organizados por categoria:',
                ''
            ];

            // Adicionar comandos por categoria
            for (const [category, cmds] of Object.entries(categories)) {
                description.push(`## ${category}`);
                cmds.forEach(cmd => {
                    description.push(`- \`!${cmd.name}\` - ${cmd.description}`);
                });
                description.push('');
            }

            description.push(
                '> Use `!comando` para executar um comando',
                '',
                '📌 **Links Úteis:**',
                '[Revolt](https://revolt.chat)',
                '[GitHub](https://github.com)'
            );

            // Enviar mensagem
            await sendEmbed(message.channel.id || message.channel, client.token, {
                title: '📚 Central de Ajuda',
                description: description.join('\n'),
                url: 'https://github.com/xandoofc/selfbot-revolt'
            });

        } catch (error) {
            console.error('Erro no comando help:', error);
            await sendEmbed(message.channel.id || message.channel, client.token, {
                title: '❌ Erro',
                description: [
                    '# Erro ao Listar Comandos',
                    '',
                    '```',
                    error.message,
                    '```',
                    '',
                    '> Por favor, tente novamente mais tarde.'
                ].join('\n')
            });
        }
    }
}; 