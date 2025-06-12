require('dotenv').config();

const config = {
    // Bot settings
    prefix: process.env.BOT_PREFIX || '!',
    token: process.env.REVOLT_TOKEN,
    ownerId: process.env.OWNER_ID,

    // Status settings
    defaultStatus: {
        text: '🤖 | Ajude com !help',
        presence: 'Online'
    },

    // Command settings
    commands: {
        cooldown: 3, // segundos
        maxArgs: 20,
        deleteCommands: false // se deve deletar as mensagens de comando
    },

    // Development settings
    dev: {
        debug: process.env.DEBUG === 'true',
        environment: process.env.NODE_ENV || 'development'
    },

    // API settings
    api: {
        baseUrl: 'https://api.revolt.chat',
        wsUrl: 'wss://ws.revolt.chat',
        timeout: 5000 // ms
    },

    // Validation
    validate() {
        if (!this.token) {
            throw new Error('Token do bot não encontrado no arquivo .env');
        }

        if (this.dev.debug) {
            console.log('Configurações carregadas:', {
                ...this,
                token: '[REDACTED]'
            });
        }
    }
};

module.exports = config; 