const fetch = require('node-fetch');

/**
 * Envia uma mensagem com embed para um canal
 * @param {Object|string} channel - O canal ou ID do canal para enviar a mensagem
 * @param {string} token - O token de autenticação
 * @param {Object} embed - O objeto do embed
 * @returns {Promise<Object>} A resposta da API
 */
async function sendEmbed(channel, token, embed) {
    try {
        // Validar parâmetros obrigatórios
        const channelId = typeof channel === 'string' ? channel : channel?.id || channel?._id;
        if (!channelId) throw new Error('Canal inválido');
        if (!token) throw new Error('Token não fornecido');

        // Preparar o corpo da requisição
        const payload = {
            content: "",
            embeds: [
                {
                    type: "Text",
                    title: embed.title || "",
                    description: embed.description || "",
                    colour: "#a81808",
                    url: embed.url || undefined,
                    icon_url: embed.icon_url || undefined,
                    media: embed.media ? {
                        url: embed.media
                    } : undefined
                }
            ]
        };

        // Remover campos undefined
        if (payload.embeds[0].url === undefined) delete payload.embeds[0].url;
        if (payload.embeds[0].icon_url === undefined) delete payload.embeds[0].icon_url;
        if (payload.embeds[0].media === undefined) delete payload.embeds[0].media;

        // Log para debug
        console.log('Enviando payload:', JSON.stringify(payload, null, 2));

        // Enviar requisição para a API
        const response = await fetch(`https://api.revolt.chat/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
                'x-session-token': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            redirect: 'follow', // Seguir redirecionamentos
            follow: 5 // Máximo de 5 redirecionamentos
        });

        // Verificar o tipo de conteúdo da resposta
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            throw new Error('API retornou HTML em vez de JSON. Token pode estar expirado.');
        }

        const responseData = await response.json();

        if (!response.ok) {
            console.error('Erro da API:', responseData);
            throw new Error(`Erro ao enviar mensagem: ${responseData.type || responseData.message || response.statusText}`);
        }

        return responseData;
    } catch (error) {
        // Se for erro de HTML, tentar reautenticar
        if (error.message.includes('HTML')) {
            console.error('Erro de autenticação. Token pode ter expirado.');
            // Aqui você pode implementar uma lógica de reautenticação se necessário
        }
        console.error('Erro em sendEmbed:', error);
        throw error;
    }
}

module.exports = sendEmbed; 