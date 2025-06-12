module.exports = {
    name: 'uptime',
    description: 'Mostra há quanto tempo o bot está online',
    async execute(message, args, client) {
        const { hours, minutes, seconds } = client.getUptime();
        await client.sendMessage(
            message.channel,
            `Online há ${hours}h ${minutes}m ${seconds}s`
        );
    }
}; 