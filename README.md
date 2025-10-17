# Servidor de Rendezvous WebSocket

Este é um servidor de *rendezvous* simples, construído com Node.js e a biblioteca `ws`. Sua principal função é ajudar dois ou mais peers (clientes) a se encontrarem em uma rede para estabelecer uma conexão P2P (Peer-to-Peer), tipicamente usando WebRTC.

O servidor não processa o conteúdo das mensagens de sinalização; ele apenas atua como um intermediário para que os peers possam trocar as informações necessárias para se conectarem diretamente.

---

## ✨ Funcionalidades

* **Registro de Peers:** Cada cliente se conecta e se registra no servidor com um ID único.
* **Descoberta de Peers:** Um cliente pode perguntar ao servidor o endereço de rede de outro cliente.
* **Retransmissão de Sinalização (Signaling Relay):** Facilita a troca de mensagens de sinalização (como ofertas SDP e candidatos ICE) entre os peers.
* **Gerenciamento de Conexão:** Utiliza um mecanismo de *heartbeat* (ping/pong) para detectar e remover conexões inativas ou "zumbis".

---

## 🚀 Instalação e Uso

### Pré-requisitos

* [Node.js](https://nodejs.org/) (versão 12.x ou superior)

### Passos

1.  **Clone o repositório ou salve o arquivo:**
    Salve o código como `rendezvous.js` em um diretório de sua escolha.

2.  **Instale as dependências:**
    Navegue até o diretório e instale a biblioteca `ws`.
    ```bash
    npm install ws
    ```

3.  **Inicie o servidor:**
    ```bash
    node rendezvous.js
    ```
    Por padrão, o servidor será executado na porta `8080`.

4.  **Configurar a porta (opcional):**
    Você pode especificar uma porta diferente usando a variável de ambiente `PORT`.
    ```bash
    PORT=3000 node rendezvous.js
    ```

---

## 💬 Protocolo de Mensagens

O servidor se comunica com os clientes usando mensagens JSON simples através do WebSocket. Abaixo estão os tipos de mensagens suportados.

### Cliente ➡️ Servidor

#### `register`
Registra um peer no servidor. Deve ser a primeira mensagem enviada após a conexão.

* **Formato:**
    ```json
    {
      "type": "register",
      "from_id": "unique-peer-id-123",
      "addr": "192.168.1.10:54321" // Opcional, o servidor usará o IP remoto se não for fornecido
    }
    ```

#### `get_address`
Solicita o endereço de rede de outro peer.

* **Formato:**
    ```json
    {
      "type": "get_address",
      "target_id": "target-peer-id-456"
    }
    ```

#### `signal`
Envia uma mensagem de sinalização para outro peer. O servidor apenas retransmite essa mensagem sem inspecionar o `payload`.

* **Formato:**
    ```json
    {
      "type": "signal",
      "to_id": "recipient-peer-id-789",
      "from_id": "sender-peer-id-123",
      "payload": { ... } // Objeto com dados de sinalização (SDP, ICE, etc.)
    }
    ```

#### `ping`
Mensagem de keep-alive para verificar a latência e manter a conexão ativa.

* **Formato:**
    ```json
    {
      "type": "ping"
    }
    ```

### Servidor ➡️ Cliente

#### `registered`
Confirmação de que o peer foi registrado com sucesso.

* **Formato:**
    ```json
    {
      "type": "registered",
      "id": "unique-peer-id-123"
    }
    ```

#### `address_response`
Resposta à solicitação `get_address`.

* **Sucesso:**
    ```json
    {
      "type": "address_response",
      "target": "target-peer-id-456",
      "found": true,
      "address": "198.51.100.20:12345"
    }
    ```
* **Falha (peer offline):**
    ```json
    {
      "type": "address_response",
      "target": "target-peer-id-456",
      "found": false,
      "error": "peer_offline"
    }
    ```

#### `signal`
Mensagem de sinalização retransmitida de outro peer. O formato é idêntico ao enviado pelo cliente de origem.

* **Formato:**
    ```json
    {
      "type": "signal",
      "to_id": "your-peer-id",
      "from_id": "sender-peer-id-123",
      "payload": { ... }
    }
    ```

#### `pong`
Resposta a uma mensagem `ping`.

* **Formato:**
    ```json
    {
      "type": "pong",
      "ts": 1678886400000 // Timestamp do servidor
    }
    ```

#### `error`
Enviado quando ocorre um erro, como um destinatário offline ou um tipo de mensagem desconhecido.

* **Formato:**
    ```json
    {
      "type": "error",
      "error": "recipient_offline", // ou "unknown_type"
      "to": "recipient-peer-id-789"
    }
    ```

---

## 📜 Licença

Não determinada