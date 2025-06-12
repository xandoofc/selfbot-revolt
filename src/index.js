require('dotenv').config();
const RevoltClient = require('./structures/Client');

const TOKEN = process.env.REVOLT_TOKEN;

if (!TOKEN) {
    console.error('Erro: Token não encontrado no .env');
    process.exit(1);
}

const client = new RevoltClient(TOKEN);

process.on('unhandledRejection', (error) => {
    console.error('Erro não tratado:', error);
});

process.on('SIGINT', () => {
    console.log('Desligando o bot...');
    if (client.ws) {
        client.ws.close();
    }
    process.exit(0);
});

client.connect(); 