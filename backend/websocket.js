const { Server } = require('socket.io');

class WebSocketManager {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: "*", // Permite conexiones desde cualquier origen
            },
            pingTimeout: 60000, // Aumenta el timeout para conexiones persistentes
            pingInterval: 25000, // Intervalo de ping
        });

        this.setupSocketEvents();
    }

    setupSocketEvents() {
        this.io.on("connection", (socket) => {
            console.log(`Nuevo cliente conectado: ${socket.id}`);

            // Unirse a una sala específica (productId)
            socket.on("joinRoom", (productId) => {
                socket.join(productId);
                console.log(`Cliente ${socket.id} unido al room: ${productId}`);
            });

            // Unirse a una sala de subasta inversa
            socket.on("joinInverseAuctionRoom", (auctionId) => {
                socket.join(auctionId);
                console.log(`Cliente ${socket.id} unido a sala de subasta inversa ${auctionId}`);
            });

            // Dejar una sala de subasta inversa
            socket.on("leaveInverseAuctionRoom", (auctionId) => {
                socket.leave(auctionId);
                console.log(`Cliente ${socket.id} salió de sala de subasta inversa ${auctionId}`);
            });

            // Evento para seguimiento de actividad del usuario
            socket.on("userActivity", (userId) => {
                console.log(`Usuario ${userId} activo en socket ${socket.id}`);
                // Podrías implementar lógica adicional aquí
            });

            // Manejar la desconexión
            socket.on("disconnect", (reason) => {
                console.log(`Cliente ${socket.id} desconectado. Razón: ${reason}`);
                // Aquí podrías añadir lógica para limpiar recursos
            });

            // Manejar errores
            socket.on("error", (error) => {
                console.error(`Error en socket ${socket.id}:`, error);
            });
        });
    }

    getIO() {
        return this.io;
    }

    // Método para emitir actualizaciones de subasta inversa
    emitInverseAuctionUpdate(auctionId, data) {
        this.io.to(auctionId).emit("inverseAuctionUpdate", data);
    }

    // Método para notificar cuando una subasta inversa se completa
    emitInverseAuctionCompleted(auctionId, data) {
        this.io.to(auctionId).emit("inverseAuctionCompleted", data);
    }

    // Método para emitir actualizaciones de puja tradicional
    emitBidUpdate(productId, data) {
        this.io.to(productId).emit("bidUpdate", data);
    }
}

module.exports = WebSocketManager;