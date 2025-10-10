# Servidor de Rendezvous para CrypChat

Este é um servidor de sinalização (rendezvous) simples, construído com Node.js e WebSockets, para ser usado com a aplicação CrypChat.

O objetivo deste servidor é atuar como um "ponto de encontro" público para que os clientes (peers) possam trocar as informações necessárias para estabelecer uma conexão P2P direta entre eles.

## Como Funciona

O servidor mantém um registro de clientes conectados associados a um ID único. A lógica é mínima e direta:

1.  **Registro**: Quando um cliente se conecta, ele deve enviar uma primeira mensagem no formato JSON para se registrar com seu ID.
    ```json
    {
      "type": "register",
      "from_id": "alice"
    }
    ```
2.  **Encaminhamento**: Todas as mensagens subsequentes são encaminhadas para o destinatário especificado no campo `to_id`. O servidor não inspeciona o `payload`, apenas atua como um carteiro.
    ```json
    {
      "from_id": "alice",
      "to_id": "bob",
      "payload": { ... }
    }
    ```
3.  **Desconexão**: Quando um cliente se desconecta, ele é removido da lista de clientes ativos.

## Como Usar

### Executando Localmente

1.  **Instale as dependências:**
    ```bash
    npm install
    ```
2.  **Inicie o servidor:**
    ```bash
    node server.js
    ```
    O servidor estará rodando em `ws://127.0.0.1:8080`.

### Deploy

Este servidor foi projetado para ser facilmente implantado em plataformas PaaS (Platform as a Service) como o Render.com.

-   **Build Command:** `npm install`
-   **Start Command:** `node server.js`

A plataforma irá detectar o `package.json` e instalar as dependências antes de iniciar o servidor.