const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;

const peers = new Map();

const wss = new WebSocket.Server({
    port: PORT,
    host: "0.0.0.0",
});

function safeSend(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

function heartbeat() {
    this.isAlive = true;
}

wss.on("connection", (ws, req) => {
    ws.isAlive = true;
    ws.on("pong", heartbeat);

    ws.on("message", (msg) => {
        try {
            const data = JSON.parse(msg);

            switch (data.type) {
                case "register": {
                    const id = data.from_id;
                    const addr = data.addr || (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress;

                    if (!id) return;

                    peers.set(id, {
                        ws,
                        addr,
                        lastSeen: Date.now(),
                    });

                    ws.peerId = id;
                    safeSend(ws, { type: "registered", id });
                    break;
                }

                case "get_address": {
                    const targetId = data.target_id;
                    const target = peers.get(targetId);

                    if (target && target.ws.readyState === WebSocket.OPEN) {
                        safeSend(ws, {
                            type: "address_response",
                            target: targetId,
                            found: true,
                            address: target.addr,
                        });
                    } else {
                        safeSend(ws, {
                            type: "address_response",
                            target: targetId,
                            found: false,
                            error: "peer_offline",
                        });
                    }
                    break;
                }

                case "signal": {
                    const recipientId = data.to_id;
                    const recipient = peers.get(recipientId);
                    if (recipient && recipient.ws.readyState === WebSocket.OPEN) {
                        safeSend(recipient.ws, data);
                    } else {
                        safeSend(ws, {
                            type: "error",
                            error: "recipient_offline",
                            to: recipientId,
                        });
                    }
                    break;
                }

                case "ping":
                    safeSend(ws, { type: "pong", ts: Date.now() });
                    break;

                default:
                    safeSend(ws, { type: "error", error: "unknown_type" });
            }
        } catch (e) {
            ws.send(JSON.stringify({ type: 'error', message: 'Mensagem inválida' }));
        }
    });

    ws.on("close", () => {
        if (ws.peerId) peers.delete(ws.peerId);
    });

    ws.on("error", () => {
        if (ws.peerId) peers.delete(ws.peerId);
    });
});

setInterval(() => {
    for (const [id, { ws }] of peers.entries()) {
        if (!ws.isAlive) {
            peers.delete(id);
            ws.terminate();
        } else {
            ws.isAlive = false;
            ws.ping();
        }
    }
}, 30000);

console.log(`# Rendezvous server ativo na porta ${PORT}`);