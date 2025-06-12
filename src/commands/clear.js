module.exports = {
    name: 'clear',
    description: 'Limpa mensagens do canal',
    category: 'Moderação',
    cooldown: 5,
    async execute(message, args, client) {
        try {
            // Verificar permissões
            const member = await message.channel.server.fetchMember(message.author._id);
            if (!member.roles.some(role => {
                const serverRole = message.channel.server.roles.get(role);
                return serverRole && serverRole.permissions.includes('ManageMessages');
            })) {
                await message.reply('❌ Você não tem permissão para usar este comando!');
                return;
            }

            // Verificar se um número foi fornecido
            if (!args.length) {
                await message.reply('❌ Por favor, forneça o número de mensagens para deletar! Exemplo: !clear 10');
                return;
            }

            const amount = parseInt(args[0]);

            // Verificar se o número é válido
            if (isNaN(amount)) {
                await message.reply('❌ Por favor, forneça um número válido!');
                return;
            }

            // Verificar se o número está dentro do limite
            if (amount < 1 || amount > 100) {
                await message.reply('❌ O número de mensagens deve estar entre 1 e 100!');
                return;
            }

            try {
                // Buscar mensagens
                const messages = await message.channel.fetchMessages({
                    limit: amount
                });

                // Deletar mensagens
                await message.channel.deleteMessages(messages.map(m => m._id));

                // Enviar confirmação
                const response = await message.reply(`✅ ${amount} mensagens foram deletadas!`);

                // Deletar mensagem de confirmação após 5 segundos
                setTimeout(async () => {
                    try {
                        await message.channel.deleteMessages([response._id]);
                    } catch (error) {
                        console.error('Erro ao deletar mensagem de confirmação:', error);
                    }
                }, 5000);

            } catch (error) {
                console.error('Erro ao deletar mensagens:', error);
                await message.reply(`❌ Erro ao deletar mensagens: ${error.message}`);
            }

        } catch (error) {
            console.error('Erro no comando clear:', error);
            await message.reply(`❌ Ocorreu um erro: ${error.message}`);
        }
    }
}; 