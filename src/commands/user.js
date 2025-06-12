const MessageFormatter = require('../utils/MessageEmbed');

module.exports = {
    name: 'user',
    description: 'Mostra informações sobre um usuário',
    category: 'Geral',
    cooldown: 3,
    async execute(message, args, client) {
        try {
            if (!message.mentions || message.mentions.length === 0) {
                const formatter = new MessageFormatter()
                    .setTitle('Erro')
                    .setDescription('Mencione um usuário! Exemplo: !user @xando')
                    .setTimestamp();

                await client.sendMessage(message.channel, formatter.toJSON());
                return;
            }

            const userId = message.mentions[0];
            const response = await fetch(`${client.config.api.baseUrl}/users/${userId}`, {
                headers: { 'x-session-token': client.token }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            const user = await response.json();
            
            const formatter = new MessageFormatter()
                .setTitle('Informações do Usuário')
                .addField('Nome', `${user.username}#${user.discriminator}`)
                .addField('ID', user._id);

            // Adiciona status se disponível
            if (user.status) {
                if (user.status.text) {
                    formatter.addField('Status', user.status.text);
                }
                if (user.status.presence) {
                    formatter.addField('Presença', user.status.presence);
                }
            }

            // Adiciona informações do avatar se disponível
            if (user.avatar) {
                formatter.addField('Avatar', `${client.config.api.baseUrl}/avatars/${user.avatar._id}`);
            }

            // Se a mensagem for de um servidor, tenta obter informações do membro
            if (message.member?._id?.server) {
                try {
                    const memberResponse = await fetch(
                        `${client.config.api.baseUrl}/servers/${message.member._id.server}/members/${userId}`,
                        { headers: { 'x-session-token': client.token } }
                    );

                    if (memberResponse.ok) {
                        const memberInfo = await memberResponse.json();
                        
                        // Adiciona roles se disponível
                        if (memberInfo.roles && memberInfo.roles.length > 0) {
                            formatter.addField('Cargos', memberInfo.roles.join(', '));
                        }

                        // Adiciona data de entrada
                        if (memberInfo.joined_at) {
                            const joinDate = new Date(memberInfo.joined_at);
                            formatter.addField('Entrou em', `<t:${Math.floor(joinDate.getTime() / 1000)}:F>`);
                        }
                    }
                } catch (error) {
                    console.error('Erro ao obter informações do membro:', error);
                }
            }

            formatter.setTimestamp();
            await client.sendMessage(message.channel, formatter.toJSON());

        } catch (error) {
            console.error('Erro ao obter informações do usuário:', error);
            
            const formatter = new MessageFormatter()
                .setTitle('Erro')
                .setDescription(`Erro ao obter informações do usuário: ${error.message}`)
                .setTimestamp();

            await client.sendMessage(message.channel, formatter.toJSON());
        }
    }
}; 