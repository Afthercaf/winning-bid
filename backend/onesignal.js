const OneSignal = require('onesignal-node');

// Crear cliente de OneSignal
const client = new OneSignal.Client({
  app: {
    appId: 'daf91c82-2378-4c24-8104-2a9c05a1cc9c', // App ID de OneSignal
    appAuthKey: 'z2loji2xme36e4uzs6skbrrrk', // API key de OneSignal
  },
});

// Función para enviar notificación
const sendNotification = async (playerId, message) => {
  try {
    const notification = {
      contents: { en: message },
      include_player_ids: [playerId], // ID de dispositivo
    };

    const response = await client.createNotification(notification);
    console.log('Notificación enviada:', response);
  } catch (error) {
    console.error('Error al enviar la notificación:', error);
  }
};

module.exports = sendNotification;
