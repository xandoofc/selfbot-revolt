const MessageFormatter = require('../utils/MessageEmbed');
const Permissions = require('../utils/Permissions');

module.exports = {
    name: 'ban',
    description: 'Bane um ou mais usuários do servidor',
    category: 'Moderação',
    cooldown: 5,
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

            // Verifica permissões
            if (!await Permissions.checkPermission(
                client,
                message,
                Permissions.FLAGS.BAN_MEMBERS,
                'Você precisa ter permissão para banir membros para usar este comando.'
            )) return;

            if (!message.mentions || message.mentions.length === 0) {
                const formatter = new MessageFormatter()
                    .setTitle('Erro')
                    .setDescription('Mencione pelo menos um usuário! Exemplo: !ban @user1 @user2 [razão]')
                    .setTimestamp();
                
                await client.sendMessage(message.channel, formatter.toJSON());
                return;
            }

            // Extrai a razão do ban (tudo após as menções)
            const reason = args.slice(message.mentions.length).join(' ') || 'Nenhuma razão fornecida';

            let bannedCount = 0;
            const bannedUsers = [];

            for (const targetId of message.mentions) {
                if (targetId === client.userId) {
                    console.log('Ignorando tentativa de banir o bot');
                    continue;
                }

                // Obtém informações do usuário antes de banir
                const userResponse = await fetch(`${client.config.api.baseUrl}/users/${targetId}`, {
                    headers: { 'x-session-token': client.token }
                });

                let username = targetId;
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    username = `${userData.username}#${userData.discriminator}`;
                }

                const banResponse = await fetch(
                    `${client.config.api.baseUrl}/servers/${message.member._id.server}/bans/${targetId}`,
                    {
                        method: 'PUT',
                        headers: {
                            'x-session-token': client.token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ reason })
                    }
                );

                if (banResponse.ok) {
                    bannedCount++;
                    bannedUsers.push(username);
                } else {
                    console.error(`Erro ao banir usuário ${targetId}:`, await banResponse.text());
                }
            }

            const formatter = new MessageFormatter()
                .setTitle('Ban')
                .setDescription(`${bannedCount} usuário(s) foram banidos.`);

            if (bannedUsers.length > 0) {
                formatter.addField('Usuários Banidos', bannedUsers.join('\n'));
            }
            
            formatter
                .addField('Razão', reason)
                .setFooter(`Banido por ${message.author}`)
                .setTimestamp();

            await client.sendMessage(message.channel, formatter.toJSON());
        } catch (error) {
            console.error('Erro ao banir usuários:', error);
            
            const formatter = new MessageFormatter()
                .setTitle('Erro')
                .setDescription(`Erro ao banir usuários: ${error.message}`)
                .setFooter(`Comando usado por ${message.author}`)
                .setTimestamp();

            await client.sendMessage(message.channel, formatter.toJSON());
        }
    }
}; 