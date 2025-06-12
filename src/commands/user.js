const fetch = require('node-fetch');
const sendEmbed = require('../utils/sendEmbed');

module.exports = {
    name: 'user',
    description: 'Mostra informações sobre um usuário',
    category: 'Informação',
    cooldown: 5,
    async execute(message, args, client) {
        try {
            // Verificar argumentos
            const targetId = args[0]?.replace(/[<@>]/g, '') || message.author._id;

            // Buscar informações do usuário via API
            const response = await fetch(`https://api.revolt.chat/users/${targetId}`, {
                headers: {
                    'x-session-token': client.token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const user = await response.json();

            // Buscar informações do membro se estiver em um servidor
            let member = null;
            if (message.member?._id?.server) {
                const memberResponse = await fetch(`https://api.revolt.chat/servers/${message.member._id.server}/members/${targetId}`, {
                    headers: {
                        'x-session-token': client.token
                    }
                });

                if (memberResponse.ok) {
                    member = await memberResponse.json();
                }
            }

            // Formatar data de entrada
            const joinedAt = member?.joined_at ? new Date(member.joined_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'N/A';

            // Construir URL do avatar
            let avatarUrl = null;
            if (user.avatar) {
                avatarUrl = `https://cdn.revolt.chat/avatars/${user.avatar._id}/${user.avatar.filename}`;
            }

            // Construir descrição
            const description = [
                '# 👤 Perfil do Usuário',
                '',
                '## 📋 Informações Básicas',
                `- **Nome:** ${user.username}`,
                `- **ID:** \`${user._id}\``,
                `- **Tag:** ${user.discriminator || 'Nenhuma'}`,
                '',
                '## 🎮 Status',
                `- **Online:** ${user.online ? '✅' : '❌'}`,
                `- **Status:** ${user.status?.text || 'Nenhum'}`,
                `- **Presença:** ${user.status?.presence || 'Desconhecida'}`,
                '',
                member ? [
                    '## 📅 Informações do Servidor',
                    `- **Entrou em:** ${joinedAt}`,
                    member.nickname ? `- **Apelido:** ${member.nickname}` : '',
                    member.roles?.length ? `- **Cargos:** ${member.roles.map(r => `<@&${r}>`).join(', ')}` : '',
                    ''
                ].filter(Boolean).join('\n') : '',
                '## 🎨 Personalização',
                `- **Avatar:** ${user.avatar ? '✅' : '❌'}`,
                `- **Banner:** ${user.banner ? '✅' : '❌'}`,
                '',
                '> Use `!help` para ver outros comandos disponíveis'
            ].filter(Boolean).join('\n');

            await sendEmbed(message.channel.id || message.channel, client.token, {
                title: `👤 ${user.username}`,
                description: description,
                url: 'https://github.com/xandoofc/selfbot-revolt',
                media: avatarUrl
            });

        } catch (error) {
            console.error('Erro ao mostrar informações do usuário:', error);
            await sendEmbed(message.channel.id || message.channel, client.token, {
                title: '❌ Erro',
                description: [
                    '# Erro ao Buscar Usuário',
                    '',
                    '```',
                    error.message,
                    '```',
                    '',
                    '> Verifique se:',
                    '- O usuário mencionado existe',
                    '- O ID do usuário é válido',
                    '- O bot tem permissão para ver o usuário'
                ].join('\n')
            });
        }
    }
}; 