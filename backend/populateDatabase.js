const { MongoClient } = require('mongodb');

// Configuración de la conexión
const uri = 'mongodb+srv://mikecrafrosado:uganbzTZm69Rmxgm@inegradora.3gsb4.mongodb.net/marketapp?retryWrites=true&w=majority&appName=inegradora';
const dbName = 'marketapp'; // Nombre de la base de datos
const collectionName = 'users'; // Nombre de la colección

// Generar usuarios ficticios
const generateUsers = (count) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push({
      nombre_usuario: `usuario${i + 1}`,
      email: `usuario${i + 1}@example.com`, // Generar emails únicos
      fecha_registro: new Date().toISOString(),
      tipo_suscripcion: i % 2 === 0 ? 'basica' : 'premium',
    });
  }
  return users;
};

// Función para insertar usuarios en lotes
const insertUsersInBatches = async (batchSize) => {
  const client = new MongoClient(uri);

  try {
    // Conexión a la base de datos
    await client.connect();
    console.log('Conexión exitosa a MongoDB Atlas');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Generar datos
    const users = generateUsers(10000); // Generar 10,000 usuarios ficticios
    console.log('Datos generados correctamente, comenzando inserción por lotes');

    // Insertar por lotes
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      try {
        await collection.insertMany(batch);
        console.log(`Lote insertado: ${i + 1} - ${i + batch.length}`);
      } catch (error) {
        console.error(`Error al insertar lote ${i + 1} - ${i + batch.length}: ${error.message}`);
      }
    }

    console.log('Todos los datos han sido insertados correctamente');
  } catch (error) {
    console.error('Error al conectar o insertar en MongoDB:', error.message);
  } finally {
    // Cerrar la conexión
    await client.close();
    console.log('Conexión a MongoDB cerrada');
  }
};

// Ejecutar la función
insertUsersInBatches(2500).catch((error) => {
  console.error('Error al ejecutar el script:', error.message);
});