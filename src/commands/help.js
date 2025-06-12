const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'help',
    description: 'Lista todos os comandos disponíveis',
    category: 'Informação',
    cooldown: 5,
    async execute(message, args, client) {
        try {
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
            let helpMessage = '📚 **Lista de Comandos**\n\n';

            // Adicionar comandos por categoria
            for (const [category, cmds] of Object.entries(categories)) {
                helpMessage += `**${category}**\n`;
                cmds.forEach(cmd => {
                    helpMessage += `\`!${cmd.name}\` - ${cmd.description}\n`;
                });
                helpMessage += '\n';
            }

            // Enviar mensagem
            await client.sendMessage(message.channel, {
                content: helpMessage
            });

        } catch (error) {
            console.error('Erro no comando help:', error);
            await client.sendMessage(message.channel, {
                content: `❌ Ocorreu um erro ao listar os comandos: ${error.message}`
            });
        }
    }
}; 