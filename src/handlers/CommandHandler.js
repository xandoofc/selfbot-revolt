const { Collection } = require('@discordjs/collection');
const { readdirSync } = require('fs');
const path = require('path');

class CommandHandler {
    constructor(client) {
        this.client = client;
        this.commands = new Collection();
        this.cooldowns = new Collection();
        this.loadCommands();
    }

    loadCommands() {
        const commandsPath = path.join(__dirname, '..', 'commands');
        const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            this.commands.set(command.name, command);
        }

        console.log(`Carregados ${this.commands.size} comandos`);
    }

    async handle(message) {
        const prefix = this.client.config.prefix;
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (args.length > this.client.config.commands.maxArgs) {
            await this.client.sendMessage(message.channel, 
                `Este comando aceita no máximo ${this.client.config.commands.maxArgs} argumentos.`);
            return;
        }

        const command = this.commands.get(commandName);
        if (!command) return;

        // Verifica cooldown
        if (!this.cooldowns.has(command.name)) {
            this.cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = this.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || this.client.config.commands.cooldown) * 1000;

        if (timestamps.has(message.author)) {
            const expirationTime = timestamps.get(message.author) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                await this.client.sendMessage(message.channel, 
                    `Por favor aguarde ${timeLeft.toFixed(1)} segundos antes de usar o comando \`${command.name}\` novamente.`);
                return;
            }
        }

        timestamps.set(message.author, now);
        setTimeout(() => timestamps.delete(message.author), cooldownAmount);

        try {
            await command.execute(message, args, this.client);
            
            // Se configurado para deletar mensagens de comando
            if (this.client.config.commands.deleteCommands) {
                // Implementar lógica de deleção quando a API do Revolt suportar
            }
        } catch (error) {
            if (this.client.config.dev.debug) {
                console.error(`Erro ao executar comando ${commandName}:`, error);
            } else {
                console.error(`Erro ao executar comando ${commandName}:`, error.message);
            }
            await this.client.sendMessage(message.channel, `Erro ao executar o comando: ${error.message}`);
        }
    }
}

module.exports = CommandHandler; 