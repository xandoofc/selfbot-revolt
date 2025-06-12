class EventHandler {
    constructor(client) {
        this.client = client;
    }

    handle(event) {
        const eventName = event.type;
        console.log('Evento recebido:', eventName);

        switch (eventName) {
            case 'Message':
                this.handleMessage(event);
                break;
            case 'Authenticated':
                console.log('Autenticado no WebSocket');
                break;
            case 'Error':
                console.error('Erro do WebSocket:', event.error);
                break;
            default:
                // Eventos não tratados são ignorados silenciosamente
                break;
        }
    }

    handleMessage(event) {
        const message = {
            ...event,
            channel: event.channel,
            author: event.author,
            member: event.member,
            content: event.content
        };

        if (!message.channel) {
            console.error('Erro: Mensagem recebida sem channel');
            return;
        }

        this.client.commands.handle(message);
    }
}

module.exports = EventHandler; 