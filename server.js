const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT, host: '0.0.0.0' });

const clients = new Map();

function heartbeat() {
    this.isAlive = true;
}

wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'register') {
                const clientId = data.from_id;
                clients.set(clientId, ws);
                ws.clientId = clientId;
                return;
            }

            const recipientId = data.to_id;
            const recipientWs = clients.get(recipientId);

            if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                recipientWs.send(message.toString());
            }
        } catch (e) {
            console.error('Erro ao processar mensagem:', e);
        }
    });

    ws.on('close', () => {
        if (ws.clientId) {
            clients.delete(ws.clientId);
        }
    });

    ws.on('error', (err) => {
        console.error('Erro no WebSocket:', err);
    });
});

const interval = setInterval(() => {
    wss.clients.forEach(ws => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

console.log(`# Servidor de Rendezvous rodando na porta ${PORT}`);