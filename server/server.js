const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Для разрешения кросс-доменных запросов

const helmet = require('helmet'); // Для установки заголовков безопасности HTTP

const { loginLimiter, registerLimiter, authenticateToken } = require('./middleware/middleware');
const { register, login, getUserById, getUsers, blockUser } = require('./controlers/controllers');

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
app.post('/register', registerLimiter, register) // (путь маршрута, middleware, контроллер)

// Авторизация пользователя (вход)
app.post('/login', loginLimiter, login) // (путь маршрута, middleware, контроллер)


// Получение пользователя по ID
app.get('/user', authenticateToken, getUserById);

// Получение списка пользователей (только для админов)
app.get('/users', authenticateToken, getUsers);

// Блокировка пользователя
app.patch('/user/block', authenticateToken, blockUser);


app.use((req, res, next) => {
  console.log(`Запрос: ${req.method} ${req.url}`);
  next();
});

// --- Запуск Сервера ---
app.listen(PORT, () => {
  console.log(`Сервер успешно запущен на http://localhost:${PORT}`);
});

