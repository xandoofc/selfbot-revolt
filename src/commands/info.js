const MessageFormatter = require('../utils/MessageEmbed');

module.exports = {
    name: 'info',
    description: 'Mostra informações sobre o servidor',
    category: 'Geral',
    cooldown: 3,
    async execute(message, args, client) {
        try {
            if (!message.member?._id?.server) {
                const formatter = new MessageFormatter()
                    .setTitle('Erro')
                    .setDescription('Este comando só pode ser usado em servidores!')
                    .setTimestamp();
                
                await client.sendMessage(message.channel, formatter.toJSON());
                return;
            }

            const response = await fetch(`${client.config.api.baseUrl}/servers/${message.member._id.server}`, {
                headers: { 'x-session-token': client.token }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            const server = await response.json();
            
            const formatter = new MessageFormatter()
                .setTitle('Informações do Servidor')
                .addField('Nome', server.name)
                .addField('ID', server._id)
                .addField('Descrição', server.description || 'Nenhuma')
                .addField('Dono', server.owner)
                .setTimestamp();

            await client.sendMessage(message.channel, formatter.toJSON());
        } catch (error) {
            console.error('Erro ao obter informações do servidor:', error);
            
            const formatter = new MessageFormatter()
                .setTitle('Erro')
                .setDescription(`Erro ao obter informações do servidor: ${error.message}`)
                .setTimestamp();

            await client.sendMessage(message.channel, formatter.toJSON());
        }
    }
}; 