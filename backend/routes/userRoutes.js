const express = require('express');
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


    

module.exports = router;
