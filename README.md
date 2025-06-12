# SB Revolt Bot

## Funcionalidades

- Sistema de comandos modular
- Gerenciamento de eventos
- Sistema de configuração flexível
- Cooldown de comandos
- Modo de debug
- Status personalizável
- Estrutura profissional e organizada
- Fácil de estender com novos comandos
- Download de mídia de várias plataformas

## Comandos Disponíveis

- `!ping` - Testa a latência do bot
- `!uptime` - Mostra há quanto tempo o bot está online
- `!info` - Mostra informações sobre o servidor
- `!user @usuário` - Mostra informações detalhadas sobre um usuário
- `!dl <link>` - Baixa e envia mídia de várias plataformas (TikTok, Instagram, YouTube, etc)

## Dependências do Sistema

Além das dependências do Node.js, o bot requer:

- **yt-dlp**: Para download de mídia de várias plataformas
  ```bash
  # Linux (usando curl)
  sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
  sudo chmod a+rx /usr/local/bin/yt-dlp

  # Windows (usando pip)
  pip install yt-dlp
  ```

- **Chrome/Chromium**: Para autenticação no TikTok (necessário estar logado no TikTok no navegador)

## Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Instale o yt-dlp (veja a seção "Dependências do Sistema")
4. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```env
   # Bot Configuration
   REVOLT_TOKEN=seu_token_aqui
   BOT_PREFIX=!
   OWNER_ID=seu_id_aqui

   # Development Settings
   DEBUG=false
   NODE_ENV=development
   ```

## Configuração

O bot possui um sistema de configuração flexível em `src/utils/config.js`. Você pode personalizar:

- Prefixo de comandos
- Status padrão do bot
- Cooldown de comandos
- Limite de argumentos
- Modo de debug
- Configurações da API
- etc

## Uso

Para iniciar o bot em modo de desenvolvimento:
```bash
npm run dev
```

Para iniciar o bot em produção:
```bash
npm start
```

## Desenvolvimento

### Adicionando Novos Comandos

1. Crie um novo arquivo em `src/commands/`
2. Use o seguinte template:
   ```javascript
   module.exports = {
       name: 'comando',
       description: 'Descrição do comando',
       cooldown: 5, // opcional, padrão definido em config.js
       async execute(message, args, client) {
           // Sua lógica aqui
       }
   };
   ```

### Exemplos de Uso do Comando dl

O comando `dl` suporta várias plataformas. Exemplos:

```bash
# Download de vídeo do TikTok (requer estar logado no Chrome)
!dl https://www.tiktok.com/@usuario/video/1234567890

# Download de Reels do Instagram
!dl https://www.instagram.com/reel/AbC123xYz/

# Download de vídeo do YouTube
!dl https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

Limitações:
- Tamanho máximo do arquivo: 25MB
- Apenas um arquivo por vez
- Sem suporte a playlists
- Para TikTok: necessário estar logado no Chrome/Chromium

Notas:
- Para downloads do TikTok, o bot usará os cookies do Chrome/Chromium. Certifique-se de estar logado no TikTok através do navegador.
- Se estiver usando outro navegador, altere `chrome` para `firefox`, `opera`, `edge`, `safari` ou `brave` no arquivo `src/commands/dl.js`.

## Contribuindo

1. Fork o projeto
2. Crie sua Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes. 