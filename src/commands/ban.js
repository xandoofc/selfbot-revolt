module.exports = {
    name: 'ban',
    description: 'Bane um usuário do servidor',
    category: 'Moderação',
    cooldown: 5,
    async execute(message, args, client) {
        try {
            // Verificar permissões
            if (!message.member.hasPermission('BanMembers')) {
                await client.sendMessage(message.channel, {
                    content: '❌ Você não tem permissão para banir membros!'
                });
                return;
            }

            // Verificar se um usuário foi mencionado
            if (!message.mentions?.length) {
                await client.sendMessage(message.channel, {
                    content: '❌ Por favor, mencione o usuário que deseja banir! Exemplo: !ban @usuário [motivo]'
                });
                return;
            }

            const targetId = message.mentions[0];
            const reason = args.slice(1).join(' ') || 'Nenhum motivo fornecido';

            // Verificar se o bot pode banir o usuário
            const targetMember = await message.channel.server.fetchMember(targetId);
            if (!targetMember) {
                await client.sendMessage(message.channel, {
                    content: '❌ Usuário não encontrado no servidor!'
                });
                return;
            }

            // Verificar se o usuário tem permissão para banir o alvo
            if (targetMember.hasPermission('BanMembers')) {
                await client.sendMessage(message.channel, {
                    content: '❌ Você não pode banir este usuário!'
                });
                return;
            }

            try {
                // Tentar notificar o usuário antes do banimento
                try {
                    const dmChannel = await client.users.createDM(targetId);
                    await client.sendMessage(dmChannel, {
                        content: `⛔ Você foi banido do servidor ${message.channel.server.name}\n📝 Motivo: ${reason}`
                    });
                } catch (dmError) {
                    console.error('Erro ao enviar DM para o usuário:', dmError);
                }

                // Banir o usuário
                await message.channel.server.banMember(targetId, reason);

                // Enviar confirmação
                await client.sendMessage(message.channel, {
                    content: `✅ Usuário <@${targetId}> foi banido!\n📝 Motivo: ${reason}`
                });

            } catch (banError) {
                console.error('Erro ao banir usuário:', banError);
                await client.sendMessage(message.channel, {
                    content: `❌ Não foi possível banir o usuário: ${banError.message}`
                });
            }

        } catch (error) {
            console.error('Erro no comando ban:', error);
            await client.sendMessage(message.channel, {
                content: `❌ Ocorreu um erro: ${error.message}`
            });
        }
    }
}; 