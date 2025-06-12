const WebSocket = require('ws');
const { EventEmitter } = require('events');
const CommandHandler = require('../handlers/CommandHandler');
const EventHandler = require('../handlers/EventHandler');
const config = require('../utils/config');

class RevoltClient extends EventEmitter {
    constructor() {
        super();
        this.config = config;
        this.token = config.token;
        this.ws = null;
        this.userId = null;
        this.startTime = Date.now();
        this.commands = new CommandHandler(this);
        this.events = new EventHandler(this);
    }

    async connect() {
        try {
            await this.getUserInfo();
            this.setupWebSocket();
            if (this.config.defaultStatus) {
                await this.setStatus(this.config.defaultStatus);
            }
        } catch (error) {
            console.error('Erro ao conectar:', error.message);
            process.exit(1);
        }
    }

    setupWebSocket() {
        this.ws = new WebSocket(this.config.api.wsUrl, {
            headers: { 'x-session-token': this.token }
        });

        this.ws.on('open', () => {
            console.log('Conectado ao WebSocket');
            this.ws.send(JSON.stringify({ type: 'Authenticate', token: this.token }));
        });

        this.ws.on('message', (data) => {
            const event = JSON.parse(data);
            if (this.config.dev.debug) {
                console.log('Evento recebido:', JSON.stringify(event, null, 2));
            }
            this.events.handle(event);
        });

        this.ws.on('error', (error) => {
            console.error('Erro no WebSocket:', error.message);
        });

        this.ws.on('close', () => {
            console.log('WebSocket desconectado. Tentando reconectar...');
            setTimeout(() => {
                process.exit(1);
            }, 5000);
        });
    }

    async getUserInfo() {
        try {
            const response = await fetch(`${this.config.api.baseUrl}/users/@me`, {
                headers: { 'x-session-token': this.token }
            });
            if (response.ok) {
                const user = await response.json();
                this.userId = user._id;
                console.log(`Logado como ${user.username}#${user.discriminator}`);
            } else {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
        } catch (error) {
            throw new Error(`Falha ao obter informações do usuário: ${error.message}`);
        }
    }

    async sendMessage(channelId, content) {
        try {
            if (!channelId) throw new Error('Channel ID não fornecido');

            const response = await fetch(`${this.config.api.baseUrl}/channels/${channelId}/messages`, {
                method: 'POST',
                headers: {
                    'x-session-token': this.token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            return await response.json();
        } catch (error) {
            if (this.config.dev.debug) {
                console.error('Erro ao enviar mensagem:', error);
            } else {
                console.error('Erro ao enviar mensagem:', error.message);
            }
            return null;
        }
    }

    async setStatus(status) {
        try {
            const response = await fetch(`${this.config.api.baseUrl}/users/@me`, {
                method: 'PATCH',
                headers: {
                    'x-session-token': this.token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
        } catch (error) {
            console.error('Erro ao definir status:', error.message);
        }
    }

    getUptime() {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;
        return { hours, minutes, seconds };
    }
}

module.exports = RevoltClient; 