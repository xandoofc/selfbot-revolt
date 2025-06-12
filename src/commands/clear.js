const MessageEmbed = require('../utils/MessageEmbed');
const Permissions = require('../utils/Permissions');

module.exports = {
    name: 'clear',
    description: 'Deleta mensagens do canal',
    cooldown: 10,
    async execute(message, args, client) {
        try {
            // Verifica permissões
            if (!await Permissions.checkPermission(
                client,
                message,
                Permissions.FLAGS.MANAGE_MESSAGES,
                'Você precisa ter permissão para gerenciar mensagens para usar este comando.'
            )) return;

            const count = parseInt(args[0]);
            if (isNaN(count) || count <= 0 || count > 100) {
                const embed = new MessageEmbed()
                    .setTitle('❌ Erro')
                    .setDescription('Por favor, forneça um número válido entre 1 e 100!')
                    .setColor('#FF0000')
                    .setFooter(`Comando usado por ${message.author}`)
                    .setTimestamp();

                await client.sendMessage(message.channel, embed.toJSON());
                return;
            }

            const response = await fetch(`${client.config.api.baseUrl}/channels/${message.channel}/messages?limit=${count}`, {
                headers: { 'x-session-token': client.token }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            const messages = await response.json();
            let deletedCount = 0;

            for (const msg of messages) {
                const deleteResponse = await fetch(`${client.config.api.baseUrl}/channels/${message.channel}/messages/${msg._id}`, {
                    method: 'DELETE',
                    headers: { 'x-session-token': client.token }
                });

                if (deleteResponse.ok) {
                    deletedCount++;
                }
            }

            const embed = new MessageEmbed()
                .setTitle('🗑️ Mensagens Deletadas')
                .setDescription(`${deletedCount} mensagens foram deletadas com sucesso.`)
                .setColor('#00FF00')
                .setFooter(`Solicitado por ${message.author}`)
                .setTimestamp();

            const responseMsg = await client.sendMessage(message.channel, embed.toJSON());

            // Auto-delete da mensagem de confirmação após 5 segundos
            setTimeout(async () => {
                try {
                    await fetch(`${client.config.api.baseUrl}/channels/${message.channel}/messages/${responseMsg._id}`, {
                        method: 'DELETE',
                        headers: { 'x-session-token': client.token }
                    });
                } catch (error) {
                    console.error('Erro ao deletar mensagem de confirmação:', error);
                }
            }, 5000);

        } catch (error) {
            console.error('Erro ao deletar mensagens:', error);
            
            const embed = new MessageEmbed()
                .setTitle('❌ Erro')
                .setDescription(`Erro ao deletar mensagens: ${error.message}`)
                .setColor('#FF0000')
                .setFooter(`Comando usado por ${message.author}`)
                .setTimestamp();

            await client.sendMessage(message.channel, embed.toJSON());
        }
    }
}; 