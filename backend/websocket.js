const { Server } = require('socket.io');
const http = require('http');

class WebSocketManager {
    constructor(app) {
        this.server = http.createServer(app);
        this.io = new Server(this.server, {
            cors: {
                origin: "*",
            }
        });

        this.setupSocketEvents();
    }

    setupSocketEvents() {
        this.io.on("connection", (socket) => {
            console.log("Nuevo cliente conectado");

            socket.on("joinRoom", (productId) => {
                console.log(`Cliente unido al room: ${productId}`);
                socket.join(productId);
            });

            socket.on("disconnect", () => {
                console.log("Cliente desconectado");
            });
        });
        
    }

    getServer() {
        return this.server; // Devolvemos el servidor HTTP
    }

    getIO() {
        return this.io; // Devolvemos la instancia de Socket.IO
    }
}

module.exports = WebSocketManager;
