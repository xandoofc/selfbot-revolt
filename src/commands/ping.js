module.exports = {
    name: 'ping',
    description: 'Responde com Pong!',
    async execute(message, args, client) {
        await client.sendMessage(message.channel, 'Pong! 🏓');
    }
}; 