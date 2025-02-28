// authController.js

const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' }); // Token de acceso con corta duración
};

const generateRefreshToken = (user) => {
    return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' }); // Token de refresco con mayor duración
};

// Endpoint de login (genera ambos tokens)
exports.login = async (req, res) => {
    // Aquí tu lógica de autenticación, luego:
    const user = { id: userId, role: userRole }; // Esto puede variar según tu modelo de usuario
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({ accessToken, refreshToken });
};

// Endpoint para renovar el access token
exports.refreshToken = (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) return res.sendStatus(401);

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const newAccessToken = generateAccessToken({ id: user.id, role: user.role });
        res.json({ accessToken: newAccessToken });
    });
};
