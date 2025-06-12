const os = require('os');

module.exports = {
    name: 'info',
    description: 'Mostra informações sobre o bot',
    category: 'Informação',
    cooldown: 5,
    async execute(message, args, client) {
        try {
            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            const memoryUsage = process.memoryUsage();
            const usedMemoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100;
            const totalMemoryMB = Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100;

            const info = `🤖 **Informações do Bot**\n\n` +
                `📊 **Status**\n` +
                `⏰ Uptime: ${uptimeStr}\n` +
                `💾 Memória: ${usedMemoryMB}MB / ${totalMemoryMB}MB\n` +
                `🖥️ CPU: ${os.cpus()[0].model}\n` +
                `💻 Sistema: ${os.type()} ${os.release()}\n\n` +
                `📈 **Estatísticas**\n` +
                `🗂️ Comandos: ${client.commands.size}`;

            await message.channel.sendMessage(info);

        } catch (error) {
            console.error('Erro ao mostrar informações:', error);
            await message.channel.sendMessage(`❌ Ocorreu um erro ao buscar informações: ${error.message}`);
        }
    }
}; 