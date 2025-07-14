
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { poolPromise, sql } = require('../config/db'); // Убедитесь, что путь к db.js правильный
const validator = require('validator');
require('dotenv').config(); // Загружает переменные окружения из .env файла
const { JWT_SECRET } = require('../utils/jwt'); // Убедитесь, что путь к jwt.js правильный



// --- Вспомогательные функции ---

// Валидация сложности пароля
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Валидация формата email
const validateEmail = (email) => {
  return email && typeof email === 'string' && validator.isEmail(email);
};

// Функция для создания небольшой случайной задержки
const randomDelay = (minMs = 100, maxMs = 400) => {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
};



// --- Контроллеры ---
const register = async (req, res, next) => {
  const { email, password, fullName, dateOfBirth, role } = req.body;

  // 1. Валидация входных данных
  if (!email || !password ) {
    const error = 'Все поля обязательны для заполнения.';
    error.statusCode = 400;
    res.json(error)
    return next(error); // Передаем ошибку дальше
  }
  if (!validateEmail(email)) {
    const error = 'Неверный формат email.';
    error.statusCode = 400;
    res.json(error)
    return next(error);
  }
  if (email.length > 255) {
    const error = 'Email слишком длинный.';
    error.statusCode = 400;
    res.json(error)
    return next(error);
  }
  if (!validatePassword(password)) {
    const error = 'Пароль должен содержать минимум 8 символов, включая заглавную букву, цифру и специальный символ.';
    error.statusCode = 400;
    res.json(error)
    return next(error);
  }
  if (password.length > 70) {
    const error = 'Пароль слишком длинный.';
    error.statusCode = 400;
    res.json(error)
    return next(error);
  }

  try {
    const pool = await poolPromise;

    // 3. Проверка существования пользователя
    const existingUser = await pool.request()
      .input('Email', sql.VarChar(255), email)
      .query('SELECT UserId FROM Users WHERE Email = @Email');

    if (existingUser.recordset.length > 0) {
      const error = 'Пользователь с таким email уже существует.';
      error.statusCode = 409; // 409 Conflict более подходящий статус
      res.json(error)
      return next(error);
    }

    // 5. Добавление пользователя в БД
    await pool.request()
      .input('Email', sql.VarChar(100), email)
      .input('Password', sql.VarChar(100), password)
      .input('FullName', sql.VarChar(255), fullName)
      .input('DateOfBirth', sql.Date, dateOfBirth)
      .input('Role', sql.VarChar(10), role)
      .input('IsActive', sql.Bit, 1)
      .query('INSERT INTO Users (FullName, DateOfBirth, Email, Password, Role, IsActive) VALUES (@FullName, @DateOfBirth, @Email, @Password, @Role, @IsActive)');

    // 6. Успешный ответ
    res.status(201).json({ message: 'Пользователь успешно зарегистрирован.' });

  } catch (err) {
    // 7. Передача ошибки базы данных или другой серверной ошибки
    console.error('Ошибка при регистрации:', err); // Логируем для отладки
    next(err); // Передаем в глобальный обработчик ошибок
  }
};


const login = async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Валидация входных данных
  if (!email || !password) {
    const error = 'Все поля обязательны для заполнения.';
    error.statusCode = 400;
    res.json(error)
    return next(error);
  }
  if (!validateEmail(email)) {
    // Не уточняем, что именно неверно (email или пароль)
    const error = 'Неверный email или пароль.';
    error.statusCode = 401; 
    res.json(error)
    return next(error);
  }

  try {
    const pool = await poolPromise;

    // 3. Поиск пользователя
    const result = await pool.request()
      .input('Email', sql.VarChar(255), email)
      .query('SELECT UserId, FullName, DateOfBirth, Email, [Password], Role, IsActive FROM Users WHERE Email = @Email');

    // 4. Проверка, найден ли пользователь
    if (result.recordset.length === 0) {
      await randomDelay(200, 500);
      const error = 'Неверный email или пароль.';
      error.statusCode = 401;
      res.json(error)
      return next(error);
    }

    const user = result.recordset[0];

    // 5. Проверка пароля
    if (password !== user.Password) {
      await randomDelay(200, 500);
      const error = 'Неверный email или пароль.';
      error.statusCode = 401;
      res.json(error)
      return next(error);
    }

    // 6. Генерация JWT
    const payload = {
      userId: user.UserId,
      email: user.Email,
      fullName: user.FullName,
      dateOfBirth: user.DateOfBirth,
      role: user.Role,
      isActive: user.IsActive
    };
    const token = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '1h' } 
    );
    
    // 7. Успешный ответ с токеном
    res.status(200).json({ message: 'Успешный вход!', token: token, userId: user.UserId }); // поменял код
  } catch (err) {
    // 8. Передача ошибки базы данных или другой серверной ошибки
    console.error('Ошибка при авторизации:', err);
    next(err);
  }
};

// Получение пользователя по ID
const getUserById = async (req, res) => {
     /*const userId = req.params.id;*/
    const { userId, email, fullName, dateOfBirth, role, isActive } = req.user; // user берется из middleware

    try {
        /*const result = await sql.query(SELECT * FROM Users WHERE UserId = ${userId});
        const user = result.recordset[0];*/

        /*if (!user) return res.status(404).json({ message: 'Пользователь не найден!' });*/
        res.json({ userId, email, fullName, dateOfBirth, role, isActive });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Получение списка пользователей (для админов)
const getUsers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.query('SELECT UserId, FullName, DateOfBirth, Email, Role, IsActive FROM Users');
        const users = result.recordset; // Массив из данных в БД

        res.json({users});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Блокировка пользователя
/*const blockUser = async (req, res) => {
    //const userId = req.params.id; // Получаем userId из параметров запроса

    try { 
        const pool = await poolPromise;
        const result = await pool.query(`SELECT * FROM Users WHERE UserID = ${userId}`);
        if (!result.recordset.length) {
            return res.status(404).json({ message: 'Пользователь не найден!' });
        }

        // Проверка прав доступа
        const loggedUserId = req.user.UserId; // id из токена
        const loggedUserRole = req.user.Role; // роль из токена

        if (loggedUserRole !== 'admin' && loggedUserId !== userId) {
            return res.status(403).json({ message: 'Запрещено!' });
        }

        const query = `UPDATE Users SET IsActive = 0 WHERE UserID = @Id`;
        await pool.query(query, { Id: userId });
        res.json({ message: 'Пользователь заблокирован!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};*/


module.exports = {
  register,
  login,
  getUserById,
  getUsers,
  blockUser
};