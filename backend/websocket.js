const { Server } = require('socket.io');

class WebSocketManager {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: "*", // Permite conexiones desde cualquier origen
            },
        });

        this.setupSocketEvents();
    }

    setupSocketEvents() {
        this.io.on("connection", (socket) => {
            console.log("Nuevo cliente conectado");

            // Unirse a una sala específica (productId)
            socket.on("joinRoom", (productId) => {
                console.log(`Cliente unido al room: ${productId}`);
                socket.join(productId);
            });

            // Manejar la desconexión
            socket.on("disconnect", () => {
                console.log("Cliente desconectado");
            });
        });
    }

    getIO() {
        return this.io; // Devuelve la instancia de Socket.IO
    }
}

module.exports = WebSocketManager;