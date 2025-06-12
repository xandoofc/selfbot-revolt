const MessageEmbed = require('../utils/MessageEmbed');
const Permissions = require('../utils/Permissions');

module.exports = {
    name: 'kick',
    description: 'Expulsa um ou mais usuários do servidor',
    category: 'Moderação',
    cooldown: 5,
    async execute(message, args, client) {
        try {
            if (!message.member?._id?.server) {
                const embed = new MessageEmbed()
                    .setTitle('❌ Erro')
                    .setDescription('Este comando só pode ser usado em servidores!')
                    .setColor('#FF0000')
                    .setTimestamp();
                
                await client.sendMessage(message.channel, embed.toJSON());
                return;
            }

            // Verifica permissões
            if (!await Permissions.checkPermission(
                client,
                message,
                Permissions.FLAGS.KICK_MEMBERS,
                'Você precisa ter permissão para expulsar membros para usar este comando.'
            )) return;

            if (!message.mentions || message.mentions.length === 0) {
                const embed = new MessageEmbed()
                    .setTitle('❌ Erro')
                    .setDescription('Mencione pelo menos um usuário! Exemplo: !kick @user1 @user2 [razão]')
                    .setColor('#FF0000')
                    .setTimestamp();
                
                await client.sendMessage(message.channel, embed.toJSON());
                return;
            }

            // Extrai a razão do kick (tudo após as menções)
            const reason = args.slice(message.mentions.length).join(' ') || 'Nenhuma razão fornecida';

            let kickedCount = 0;
            const kickedUsers = [];

            for (const targetId of message.mentions) {
                if (targetId === client.userId) {
                    console.log('Ignorando tentativa de expulsar o bot');
                    continue;
                }

                // Obtém informações do usuário antes de expulsar
                const userResponse = await fetch(`${client.config.api.baseUrl}/users/${targetId}`, {
                    headers: { 'x-session-token': client.token }
                });

                let username = targetId;
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    username = `${userData.username}#${userData.discriminator}`;
                }

                const kickResponse = await fetch(
                    `${client.config.api.baseUrl}/servers/${message.member._id.server}/members/${targetId}`,
                    {
                        method: 'DELETE',
                        headers: { 'x-session-token': client.token }
                    }
                );

                if (kickResponse.ok) {
                    kickedCount++;
                    kickedUsers.push(username);
                } else {
                    console.error(`Erro ao expulsar usuário ${targetId}:`, await kickResponse.text());
                }
            }

            const embed = new MessageEmbed()
                .setTitle('👢 Kick')
                .setDescription(`${kickedCount} usuário(s) foram expulsos.`)
                .setColor('#FFA500')
                .setTimestamp();

            if (kickedUsers.length > 0) {
                embed.addField('Usuários Expulsos', kickedUsers.join('\n'));
            }
            
            embed.addField('Razão', reason)
                .setFooter(`Expulso por ${message.author}`);

            await client.sendMessage(message.channel, embed.toJSON());
        } catch (error) {
            console.error('Erro ao expulsar usuários:', error);
            
            const embed = new MessageEmbed()
                .setTitle('❌ Erro')
                .setDescription(`Erro ao expulsar usuários: ${error.message}`)
                .setColor('#FF0000')
                .setFooter(`Comando usado por ${message.author}`)
                .setTimestamp();

            await client.sendMessage(message.channel, embed.toJSON());
        }
    }
}; 