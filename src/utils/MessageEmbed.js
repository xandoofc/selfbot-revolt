class MessageFormatter {
    constructor() {
        this.content = {
            title: '',
            description: '',
            fields: [],
            footer: null,
            timestamp: null
        };
    }

    setTitle(title) {
        this.content.title = title;
        return this;
    }

    setDescription(description) {
        this.content.description = description;
        return this;
    }

    addField(name, value) {
        this.content.fields.push({ name, value });
        return this;
    }

    setFooter(text) {
        this.content.footer = { text };
        return this;
    }

    setTimestamp() {
        this.content.timestamp = new Date().toISOString();
        return this;
    }

    toJSON() {
        const lines = [];

        // Título com decoração
        if (this.content.title) {
            lines.push('═══ ' + this.content.title + ' ═══');
            lines.push('');
        }

        // Descrição
        if (this.content.description) {
            lines.push(this.content.description);
            lines.push('');
        }

        // Campos
        if (this.content.fields.length > 0) {
            for (const field of this.content.fields) {
                lines.push(`• ${field.name}:`);
                lines.push(field.value);
                lines.push('');
            }
        }

        // Rodapé
        if (this.content.footer) {
            lines.push('───────────────');
            lines.push(this.content.footer.text);
        }

        // Timestamp
        if (this.content.timestamp) {
            const time = Math.floor(new Date(this.content.timestamp).getTime() / 1000);
            lines.push(`<t:${time}:R>`);
        }

        return lines.join('\n').trim();
    }
}

module.exports = MessageFormatter; 