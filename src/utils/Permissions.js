class Permissions {
    static FLAGS = {
        OWNER: 1 << 0,
        ADMIN: 1 << 1,
        MANAGE_MESSAGES: 1 << 2,
        KICK_MEMBERS: 1 << 3,
        BAN_MEMBERS: 1 << 4
    };

    static async hasPermission(client, message, permission) {
        // Sempre permite o dono do bot
        if (message.author === client.config.ownerId) {
            return true;
        }

        // Se precisar ser dono do servidor
        if (permission === this.FLAGS.OWNER) {
            try {
                const response = await fetch(
                    `${client.config.api.baseUrl}/servers/${message.member._id.server}`,
                    { headers: { 'x-session-token': client.token } }
                );

                if (!response.ok) return false;

                const server = await response.json();
                return server.owner === message.author;
            } catch {
                return false;
            }
        }

        // Implementar outras verificações de permissão conforme necessário
        return true;
    }

    static async checkPermission(client, message, permission, errorMessage) {
        const hasPermission = await this.hasPermission(client, message, permission);
        if (!hasPermission) {
            await client.sendMessage(
                message.channel,
                errorMessage || 'Você não tem permissão para usar este comando.'
            );
        }
        return hasPermission;
    }
}

module.exports = Permissions; 