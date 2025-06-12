const fetch = require('node-fetch');
const sendEmbed = require('../utils/sendEmbed');

// Função para formatar data
function formatDate(dateString) {
    try {
        // Converter timestamp para milissegundos se for em segundos
        const timestamp = dateString * 1000;
        const date = new Date(timestamp);
        
        // Verificar se a data é válida
        if (isNaN(date.getTime())) {
            // Tentar parse direto se não for timestamp
            const directDate = new Date(dateString);
            if (isNaN(directDate.getTime())) {
                return 'Data não disponível';
            }
            return directDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Data não disponível';
    }
}

module.exports = {
    name: 'info',
    description: 'Mostra informações sobre o servidor',
    category: 'Informação',
    cooldown: 5,
    async execute(message, args, client) {
        try {
            if (!message.member?._id?.server) {
                await sendEmbed(message.channel.id || message.channel, client.token, {
                    title: '❌ Erro',
                    description: [
                        '# Comando Indisponível',
                        '',
                        '> Este comando só pode ser usado em servidores!',
                        '',
                        '```',
                        'Use este comando dentro de um servidor.',
                        '```'
                    ].join('\n'),
                    color: '#ff0000'
                });
                return;
            }

            const serverId = message.member._id.server;
            
            // Buscar informações do servidor via API
            const response = await fetch(`https://api.revolt.chat/servers/${serverId}`, {
                headers: {
                    'x-session-token': client.token
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const server = await response.json();

            // Buscar membros do servidor
            const membersResponse = await fetch(`https://api.revolt.chat/servers/${serverId}/members`, {
                headers: {
                    'x-session-token': client.token
                }
            });

            if (!membersResponse.ok) {
                throw new Error(`HTTP error! status: ${membersResponse.status}`);
            }

            const members = await membersResponse.json();

            // Contar membros online (verificar se members é um array)
            const membersArray = Array.isArray(members) ? members : Object.values(members);
            const onlineMembers = membersArray.filter(member => member?.presence?.online || member?.online).length;
            const totalMembers = membersArray.length;

            // Formatar data de criação
            const createdAtFormatted = formatDate(server.created_at);

            // Construir URL do ícone do servidor
            let iconUrl = null;
            if (server.icon) {
                iconUrl = `https://cdn.revolt.chat/icons/${server.icon._id}/${server.icon.filename}`;
            }

            const description = [
                '# 🌟 Informações do Servidor',
                '',
                '## 📋 Detalhes Gerais',
                `- **Nome:** ${server.name}`,
                `- **ID:** \`${server._id}\``,
                `- **Dono:** <@${server.owner}>`,
                `- **Criado em:** ${createdAtFormatted}`,
                '',
                '## 👥 Membros',
                `- **Total:** ${totalMembers}`,
                `- **Online:** ${onlineMembers}`,
                '',
                '## 🏗️ Estrutura',
                `- **Canais:** ${server.channels?.length || 0}`,
                `- **Cargos:** ${Object.keys(server.roles || {}).length}`,
                '',
                server.description ? [
                    '## 📝 Descrição',
                    '```',
                    server.description,
                    '```',
                    ''
                ].join('\n') : '',
                '## 🎨 Personalização',
                `- **Banner:** ${server.banner ? '✅' : '❌'}`,
                `- **Ícone:** ${server.icon ? '✅' : '❌'}`,
                '',
                '> Use `!help` para ver outros comandos disponíveis'
            ].filter(Boolean).join('\n');

            await sendEmbed(message.channel.id || message.channel, client.token, {
                title: '🌟 Informações do Servidor',
                description: description,
                url: 'https://github.com/xandoofc/selfbot-revolt',
                media: iconUrl
            });

        } catch (error) {
            console.error('Erro ao mostrar informações do servidor:', error);
            await sendEmbed(message.channel.id || message.channel, client.token, {
                title: '❌ Erro',
                description: [
                    '# Erro ao Buscar Informações',
                    '',
                    '```',
                    error.message,
                    '```',
                    '',
                    '> Por favor, tente novamente mais tarde.'
                ].join('\n')
            });
        }
    }
}; 