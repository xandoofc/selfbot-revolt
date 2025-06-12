module.exports = {
    name: 'user',
    description: 'Mostra informações sobre um usuário',
    category: 'Informação',
    cooldown: 5,
    async execute(message, args, client) {
        try {
            // Pegar o usuário mencionado ou o autor da mensagem
            const targetUser = message.mentions?.length > 0 
                ? await client.users.fetch(message.mentions[0])
                : message.author;

            if (!targetUser) {
                await message.reply('❌ Usuário não encontrado.');
                return;
            }

            // Formatar data de criação da conta
            const createdAt = new Date(targetUser.createdAt);
            const createdAtFormatted = createdAt.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Pegar informações do servidor se disponível
            let serverInfo = '';
            if (message.channel.server) {
                const member = await message.channel.server.fetchMember(targetUser._id);
                if (member) {
                    const joinedAt = new Date(member.joinedAt);
                    const joinedAtFormatted = joinedAt.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    const roles = member.roles
                        .map(roleId => message.channel.server.roles.get(roleId))
                        .filter(role => role)
                        .map(role => role.name)
                        .join(', ');

                    serverInfo = `\n📅 **Entrou no servidor em:** ${joinedAtFormatted}\n` +
                        `👥 **Cargos:** ${roles || 'Nenhum'}`;
                }
            }

            // Construir a mensagem
            const userInfo = `👤 **Informações do Usuário**\n\n` +
                `🆔 **ID:** ${targetUser._id}\n` +
                `👤 **Username:** ${targetUser.username}\n` +
                `📝 **Conta criada em:** ${createdAtFormatted}\n` +
                `🤖 **Bot:** ${targetUser.bot ? 'Sim' : 'Não'}` +
                serverInfo;

            // Enviar a mensagem
            await message.reply(userInfo);

        } catch (error) {
            console.error('Erro ao mostrar informações do usuário:', error);
            await message.reply(`❌ Ocorreu um erro ao buscar informações do usuário: ${error.message}`);
        }
    }
}; 