const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken'); // шифрование данных пользователя
const { JWT_SECRET } = require('../utils/jwt');


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Слишком много попыток входа с этого IP, попробуйте позже через 15 минут.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Слишком много регистраций с этого IP, попробуйте позже через час.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Middleware для проверки JWT (Аутентификация) ---
const authenticateToken = (req, res, next) => {
  // Ищем токен в заголовке Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Извлекаем сам токен

  if (token == null) {
    // Если токена нет, отправляем статус 401 (Не авторизован)
    return res.status(401).json({ message: 'Требуется аутентификация.' });
  }

  // Проверяем валидность токена
  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      // Если токен невалиден (ошибка подписи, истек срок действия)
      console.log('Ошибка верификации JWT:', err.message);
      // Отправляем статус 403 (Запрещено)
      return res.status(403).json({ message: 'Невалидный или истекший токен.' });
    }
    // Если токен валиден, добавляем расшифрованные данные (payload) в объект запроса
    req.user = userPayload;
    next(); // Передаем управление следующему обработчику
  });
};

// --- Middleware для проверки JWT (Админка) ---
const adminToken = (req, res, next) => {
  const adminHeader = req.headers['adminauthorization']; // Извлекаем админский токен
  const adminToken = adminHeader && adminHeader.split(' ')[1];

  if (!adminToken) {
    return res.status(401).json({ message: 'Требуется админка.' });
  }

  jwt.verify(adminToken, JWT_SECRET, (err, userPayload) => {
    if (err) {
      console.log('Ошибка верификации JWT:', err.message);
      return res.status(403).json({ message: 'Невалидный или истекший токен.' });
    }
    if (userPayload.role !== 'admin') {
      return res.status(403).json({ message: 'Нет доступа. Вы не администратор.' });
    }
    req.user = userPayload; // Добавляем данные пользователя
    next(); // Передаем управление следующему обработчику
  });
};

module.exports = {
  loginLimiter,
  registerLimiter,
  authenticateToken,
  adminToken
};