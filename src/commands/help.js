const MessageFormatter = require('../utils/MessageEmbed');

module.exports = {
    name: 'help',
    description: 'Mostra a lista de comandos disponíveis',
    cooldown: 3,
    async execute(message, args, client) {
        try {
            const commands = client.commands.commands;
            const formatter = new MessageFormatter();
            
            if (args.length > 0) {
                // Se um comando específico foi solicitado
                const commandName = args[0].toLowerCase();
                const command = commands.get(commandName);
                
                if (!command) {
                    formatter
                        .setTitle('Comando não encontrado')
                        .setDescription(`O comando \`${commandName}\` não existe.`);

                    await client.sendMessage(message.channel, formatter.toJSON());
                    return;
                }

                formatter
                    .setTitle(`Ajuda: ${client.config.prefix}${command.name}`)
                    .addField('Descrição', command.description)
                    .addField('Cooldown', `${command.cooldown || client.config.commands.cooldown} segundos`);

                await client.sendMessage(message.channel, formatter.toJSON());
                return;
            }

            // Agrupa comandos por categoria
            const categories = new Map();
            commands.forEach(cmd => {
                const category = cmd.category || 'Geral';
                if (!categories.has(category)) {
                    categories.set(category, []);
                }
                categories.get(category).push(cmd);
            });

            formatter.setTitle('Lista de Comandos');

            // Adiciona cada categoria como um campo
            for (const [category, cmds] of categories) {
                const commandList = cmds
                    .map(cmd => `${client.config.prefix}${cmd.name} - ${cmd.description}`)
                    .join('\n');
                
                formatter.addField(category, commandList);
            }

            formatter
                .setDescription(`Use \`${client.config.prefix}help <comando>\` para mais informações sobre um comando específico.`)
                .setFooter(`${commands.size} comandos disponíveis`);

            await client.sendMessage(message.channel, formatter.toJSON());
        } catch (error) {
            console.error('Erro ao mostrar ajuda:', error);
            
            const formatter = new MessageFormatter()
                .setTitle('Erro')
                .setDescription(`Erro ao mostrar ajuda: ${error.message}`)
                .setTimestamp();

            await client.sendMessage(message.channel, formatter.toJSON());
        }
    }
}; 