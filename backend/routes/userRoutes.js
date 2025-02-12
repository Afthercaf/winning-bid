const express = require('express');
const User = require('../models/User');
const Role = require('../models/Role'); 
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/', userController.getUsers);
// Ruta para obtener los últimos 3 usuarios
router.get('/latest', userController.getLatestUsers);
// Obtener el número total de clientes
router.get('/count', userController.getTotalClientes);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.put('/:id/avatar', userController.updateAvatar); // Nueva ruta para actualizar avatar
router.delete('/:id', userController.deleteUser);
// Ruta para obtener el avatar del usuario actual
router.get('/:id/avatar', userController.getAvatar);

router.post('/save-player-id', async (req, res) => {
    const { userId, playerId } = req.body;
  
    try {
      // Asegúrate de que el `userId` y `playerId` sean válidos
      if (!userId || !playerId) {
        return res.status(400).json({ error: 'userId y playerId son requeridos' });
      }
  
      // Guardar el `playerId` en la base de datos (modificar según tu esquema)
      await User.findByIdAndUpdate(userId, { playerId });
  
      res.status(200).json({ message: 'Player ID guardado con éxito' });
    } catch (error) {
      console.error('Error al guardar el Player ID:', error);
      res.status(500).json({ error: 'Error al guardar el Player ID' });
    }
  });
  
    

module.exports = router;
