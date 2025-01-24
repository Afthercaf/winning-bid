import express from "express";
import { MongoClient } from "mongodb";
import { faker } from "@faker-js/faker";

const app = express();
const port = 3000;
const uri = "mongodb+srv://mikecrafrosado:uganbzTZm69Rmxgm@inegradora.3gsb4.mongodb.net/marketapp?retryWrites=true&w=majority&appName=inegradora";
const productId = "674937ef4de80aec805008d5";

// Generar ofertas falsas
async function generateFakeBids() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Conectado a MongoDB");

    const database = client.db("tecnoshop");
    const collection = database.collection("bids");

    const fakeBids = [];

    for (let i = 0; i < 1000; i++) {
      const name = `${faker.person.firstName()} ${faker.person.lastName()}`;
      const bidAmount = faker.number.int({ min: 300, max: 10000 });
      const bidTime = faker.date.recent({ days: 7 });

      fakeBids.push({
        productId,
        bidderName: name,
        bidAmount,
        bidTime,
      });
    }

    const result = await collection.insertMany(fakeBids);
    console.log(`${result.insertedCount} ofertas falsas insertadas correctamente.`);
  } catch (error) {
    console.error("Error al generar ofertas falsas:", error);
  } finally {
    await client.close();
  }
}

// Ruta para obtener las ofertas paginadas
app.get("/api/bids", async (req, res) => {
  const client = new MongoClient(uri);
  const { page = 1, limit = 10 } = req.query;

  try {
    await client.connect();
    const database = client.db("tecnoshop");
    const collection = database.collection("bids");

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const bids = await collection
      .find({ productId })
      .sort({ bidTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const totalBids = await collection.countDocuments({ productId });

    res.json({
      status: "success",
      bids,
      pagination: {
        total: totalBids,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener las ofertas:", error);
    res.status(500).json({ status: "error", message: "Error al obtener las ofertas" });
  } finally {
    await client.close();
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});

// Llamar a la función para generar ofertas falsas
generateFakeBids();
