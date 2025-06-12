module.exports = {
    name: 'ban',
    description: 'Bane um usuário do servidor',
    category: 'Moderação',
    cooldown: 5,
    async execute(message, args, client) {
        try {
            // Verificar permissões
            const member = await message.channel.server.fetchMember(message.author._id);
            if (!member.roles.some(role => {
                const serverRole = message.channel.server.roles.get(role);
                return serverRole && serverRole.permissions.includes('BanMembers');
            })) {
                await message.reply('❌ Você não tem permissão para banir membros!');
                return;
            }

            // Verificar se um usuário foi mencionado
            if (!message.mentions?.length) {
                await message.reply('❌ Por favor, mencione o usuário que deseja banir! Exemplo: !ban @usuário [motivo]');
                return;
            }

            const targetId = message.mentions[0];
            const reason = args.slice(1).join(' ') || 'Nenhum motivo fornecido';

            // Verificar se o bot pode banir o usuário
            const targetMember = await message.channel.server.fetchMember(targetId);
            if (!targetMember) {
                await message.reply('❌ Usuário não encontrado no servidor!');
                return;
            }

            // Verificar se o usuário tem permissão para banir o alvo
            if (targetMember.roles.some(role => {
                const serverRole = message.channel.server.roles.get(role);
                return serverRole && serverRole.permissions.includes('BanMembers');
            })) {
                await message.reply('❌ Você não pode banir este usuário!');
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
                await message.reply(`✅ Usuário <@${targetId}> foi banido!\n📝 Motivo: ${reason}`);

            } catch (banError) {
                console.error('Erro ao banir usuário:', banError);
                await message.reply(`❌ Não foi possível banir o usuário: ${banError.message}`);
            }

        } catch (error) {
            console.error('Erro no comando ban:', error);
            await message.reply(`❌ Ocorreu um erro: ${error.message}`);
        }
    }
}; 