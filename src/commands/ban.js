module.exports = {
    name: 'ban',
    description: 'Bane um usuário do servidor',
    category: 'Moderação',
    cooldown: 5,
    async execute(message, args, client) {
        try {
            // Verificar permissões
            const member = await message.channel.server.members.get(message.author._id);
            if (!member.roles.some(role => {
                const serverRole = message.channel.server.roles.get(role);
                return serverRole && serverRole.permissions.includes('BanMembers');
            })) {
                await message.channel.sendMessage('❌ Você não tem permissão para banir membros!');
                return;
            }

            // Verificar se um usuário foi mencionado
            if (!message.mentions?.length) {
                await message.channel.sendMessage('❌ Por favor, mencione o usuário que deseja banir! Exemplo: !ban @usuário [motivo]');
                return;
            }

            const targetId = message.mentions[0];
            const reason = args.slice(1).join(' ') || 'Nenhum motivo fornecido';

            // Verificar se o bot pode banir o usuário
            const targetMember = await message.channel.server.members.get(targetId);
            if (!targetMember) {
                await message.channel.sendMessage('❌ Usuário não encontrado no servidor!');
                return;
            }

            // Verificar se o usuário tem permissão para banir o alvo
            if (targetMember.roles.some(role => {
                const serverRole = message.channel.server.roles.get(role);
                return serverRole && serverRole.permissions.includes('BanMembers');
            })) {
                await message.channel.sendMessage('❌ Você não pode banir este usuário!');
                return;
            }

            try {
                // Tentar notificar o usuário antes do banimento
                try {
                    const dmChannel = await client.users.createDM(targetId);
                    await dmChannel.sendMessage(`⛔ Você foi banido do servidor ${message.channel.server.name}\n📝 Motivo: ${reason}`);
                } catch (dmError) {
                    console.error('Erro ao enviar DM para o usuário:', dmError);
                }

                // Banir o usuário
                await message.channel.server.banMember(targetId, reason);

                // Enviar confirmação
                await message.channel.sendMessage(`✅ Usuário <@${targetId}> foi banido!\n📝 Motivo: ${reason}`);

            } catch (banError) {
                console.error('Erro ao banir usuário:', banError);
                await message.channel.sendMessage(`❌ Não foi possível banir o usuário: ${banError.message}`);
            }

        } catch (error) {
            console.error('Erro no comando ban:', error);
            await message.channel.sendMessage(`❌ Ocorreu um erro: ${error.message}`);
        }
    }
}; 