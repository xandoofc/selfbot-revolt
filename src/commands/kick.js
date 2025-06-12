const MessageEmbed = require('../utils/MessageEmbed');
const Permissions = require('../utils/Permissions');

module.exports = {
    name: 'kick',
    description: 'Expulsa um usuário do servidor',
    category: 'Moderação',
    cooldown: 5,
    async execute(message, args, client) {
        try {
            // Verificar permissões
            const member = await message.channel.server.fetchMember(message.author._id);
            if (!member.roles.some(role => {
                const serverRole = message.channel.server.roles.get(role);
                return serverRole && serverRole.permissions.includes('KickMembers');
            })) {
                await message.reply('❌ Você não tem permissão para expulsar membros!');
                return;
            }

            // Verificar se um usuário foi mencionado
            if (!message.mentions?.length) {
                await message.reply('❌ Por favor, mencione o usuário que deseja expulsar! Exemplo: !kick @usuário [motivo]');
                return;
            }

            const targetId = message.mentions[0];
            const reason = args.slice(1).join(' ') || 'Nenhum motivo fornecido';

            // Verificar se o bot pode expulsar o usuário
            const targetMember = await message.channel.server.fetchMember(targetId);
            if (!targetMember) {
                await message.reply('❌ Usuário não encontrado no servidor!');
                return;
            }

            // Verificar se o usuário tem permissão para expulsar o alvo
            if (targetMember.roles.some(role => {
                const serverRole = message.channel.server.roles.get(role);
                return serverRole && serverRole.permissions.includes('KickMembers');
            })) {
                await message.reply('❌ Você não pode expulsar este usuário!');
                return;
            }

            try {
                // Tentar expulsar o usuário
                await message.channel.server.kickMember(targetId, reason);

                // Enviar confirmação
                await message.reply(`✅ Usuário <@${targetId}> foi expulso!\n📝 Motivo: ${reason}`);

                // Tentar notificar o usuário
                try {
                    const dmChannel = await client.users.createDM(targetId);
                    await dmChannel.sendMessage(`🚫 Você foi expulso do servidor ${message.channel.server.name}\n📝 Motivo: ${reason}`);
                } catch (dmError) {
                    console.error('Erro ao enviar DM para o usuário:', dmError);
                }

            } catch (kickError) {
                console.error('Erro ao expulsar usuário:', kickError);
                await message.reply(`❌ Não foi possível expulsar o usuário: ${kickError.message}`);
            }

        } catch (error) {
            console.error('Erro no comando kick:', error);
            await message.reply(`❌ Ocorreu um erro: ${error.message}`);
        }
    }
}; 