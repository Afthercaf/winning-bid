const OneSignal = require("onesignal-node");

const oneSignalClient = new OneSignal.Client({
    userAuthKey: process.env.ONESIGNAL_USER_AUTH_KEY,
    app: { 
        appAuthKey: process.env.ONESIGNAL_APP_AUTH_KEY, 
        appId: process.env.ONESIGNAL_APP_ID 
    }
});

const sendNotification = async (userId, title, message) => {
    try {
        const notification = {
            headings: { en: title },
            contents: { en: message },
            include_external_user_ids: [userId], // Se usa el userId de OneSignal
        };

        await oneSignalClient.createNotification(notification);
        console.log(`📩 Notificación enviada a ${userId}: ${title}`);
    } catch (error) {
        console.error("❌ Error al enviar notificación:", error);
    }
};

module.exports = { sendNotification };
