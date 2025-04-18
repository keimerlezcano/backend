const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
    console.log(`[Auth Middleware] Ejecutando para: ${req.method} ${req.originalUrl}`); // Log ruta actual

    if (!secretKey) {
        console.error("[Auth Middleware] FATAL ERROR: JWT_SECRET no definida.");
        return res.status(500).json({ message: 'Internal server configuration error.' });
    }

    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[Auth Middleware] Token no encontrado o formato incorrecto.');
        return res.status(401).json({ message: 'Authentication required (Token missing or bad format)' });
    }

    const token = authHeader.split(' ')[1];
    console.log('[Auth Middleware] Intentando verificar token:', token); // Log token

    try {
        // Intenta verificar...
        const decoded = jwt.verify(token, secretKey);
        // Si llega aquí, la verificación fue EXITOSA
        console.log('[Auth Middleware] VERIFICACIÓN EXITOSA. Payload:', decoded);
        req.user = decoded;
        next(); // Continuar

    } catch (error) {
        // Si entra al catch, jwt.verify falló
        console.error('[Auth Middleware] VERIFICACIÓN FALLIDA:', error.name, error.message);
        let message = 'Invalid token';
        if (error.name === 'TokenExpiredError') {
            message = 'Token expired';
        } else if (error.name === 'JsonWebTokenError') {
            message = 'Malformed or invalid token signature';
        }
        // Devuelve 401 porque la verificación falló
        return res.status(401).json({ message });
    }
};

module.exports = { authenticate };