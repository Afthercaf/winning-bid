const cron = require("node-cron");
const Product = require("../models/Product");
const Bid = require("../models/Bid");
const User = require("../models/User");
const { sendNotification } = require("../onesignal");

cron.schedule("*/1 * * * *", async () => { // Ejecuta cada 1 minuto
    try {
        const now = new Date();
        const expiredAuctions = await Product.find({
            type: "subasta",
            endTime: { $lte: now },
            status: "activa",
        });

        for (const auction of expiredAuctions) {
            const highestBid = await Bid.findOne({ auctionId: auction._id }).sort({ bidAmount: -1 });

            if (highestBid) {
                const winner = await User.findById(highestBid.userId);
                if (winner && winner.oneSignalId) {
                    await sendNotification(
                        winner.oneSignalId,
                        "¡Has ganado la subasta!",
                        `Felicidades, tu puja en ${auction.name} fue la más alta.`
                    );
                }
            }

            // Marcar la subasta como finalizada
            await Product.findByIdAndUpdate(auction._id, { status: "finalizada" });
        }
    } catch (error) {
        console.error("Error al finalizar subasta:", error);
    }
});

console.log("📅 Cron job para finalizar subastas activado.");
