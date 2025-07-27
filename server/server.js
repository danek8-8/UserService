const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Для разрешения кросс-доменных запросов

const helmet = require('helmet'); // Для установки заголовков безопасности HTTP

const { loginLimiter, registerLimiter, authenticateToken, adminToken } = require('./middleware/middleware');
const { register, login, getUserById, getUsers, blockUser, profile } = require('./controlers/controllers');

// Инициализация Express приложения
const app = express();
const PORT = process.env.PORT || 5000; // Порт из .env или 5000 по умолчанию



// Helmet: Устанавливает различные HTTP-заголовки для повышения безопасности
app.use(helmet());

// CORS: Разрешает запросы с других доменов (настройте более строго для продакшена)
app.use(cors ({origin: 'http://localhost:8080',}));


// Body Parser: Позволяет парсить JSON тела запросов
app.use(bodyParser.json());

// Регистрация пользователя
app.post('/api/register', registerLimiter, register) // (путь маршрута, middleware, контроллер)

// Авторизация пользователя (вход)
app.post('/api/login', loginLimiter, login) // (путь маршрута, middleware, контроллер)

// Профиль пользователя
app.get('/api/profile', authenticateToken, profile);

// Получение пользователя по ID
app.get('/api/users/:id', authenticateToken, adminToken, getUserById);

// Получение списка пользователей (только для админов)
app.get('/api/users', authenticateToken, adminToken, getUsers);

// Блокировка пользователя
app.patch('/api/users/:id/block', authenticateToken, adminToken, blockUser);


app.use((req, res, next) => {
  console.log(`Запрос: ${req.method} ${req.url}`);
  next();
});

// --- Запуск Сервера ---
app.listen(PORT, () => {
  console.log(`Сервер успешно запущен на http://localhost:${PORT}`);
});

