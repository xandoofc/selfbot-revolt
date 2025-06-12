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
            embeds: [{
                title: embed.title || "",
                description: embed.description || "",
                colour: "#a81808",
                url: embed.url || "https://github.com/xandoofc/selfbot-revolt"
            }]
        };

        // Adicionar media apenas se existir
        if (embed.media) {
            payload.embeds[0].media = {
                url: embed.media
            };
        }

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
            body: JSON.stringify(payload)
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('Erro da API:', responseData);
            throw new Error(`Erro ao enviar mensagem: ${responseData.error?.reason || responseData.type || response.statusText}`);
        }

        return responseData;
    } catch (error) {
        console.error('Erro em sendEmbed:', error);
        throw error;
    }
}

module.exports = sendEmbed; 