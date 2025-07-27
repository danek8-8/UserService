// server/db.js
require('dotenv').config(); // Загружаем переменные из .env файла
const sql = require('mssql');

// --- Конфигурация подключения ---
// Читаем из .env и преобразуем типы где необходимо
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, // Пароль нужен здесь для создания соединения
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT, 10) || 1433, // Парсим порт, 1433 - порт по умолчанию
    options: {
        // Преобразуем строки 'true'/'false' в булевы значения
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true'
    },
    pool: {
        max: 10, // Максимальное количество соединений в пуле
        min: 0,  // Минимальное количество соединений в пуле
        idleTimeoutMillis: 30000 // Время простоя соединения перед закрытием (мс)
    }
};

// Логируем конфигурацию для отладки (БЕЗ ПАРОЛЯ!)
console.log('Конфигурация базы данных загружена');

// --- Создание и экспорт `poolPromise` ---
// Мы используем IIFE (Immediately Invoked Function Expression) async-функцию,
// чтобы выполнить логику подключения и вернуть промис.
const poolPromise = (async () => {
    try {
        console.log('Попытка подключиться к SQL Server и создать пул соединений ...');

        // Создаем экземпляр пула с полной конфигурацией
        const pool = new sql.ConnectionPool(dbConfig);

        // *** УЛУЧШЕНИЕ: Добавляем обработчик ошибок пула ***
        // Этот обработчик будет срабатывать на ошибки, возникающие *после*
        // успешного начального подключения (например, разрыв сети).
        pool.on('error', err => {
            console.error('SQL Pool Error:', err);
          
        });

        // Подключаемся к базе данных
        await pool.connect();

        console.log('Пул соединений SQL Server успешно подключен!');
        // Возвращаем успешно подключенный пул, который станет результатом промиса poolPromise
        return pool;

    } catch (err) {
        // Ловим ошибки, возникшие именно при *первоначальном* подключении
        console.error('CRITICAL: Database Connection Failed:', err);
        // Пробрасываем ошибку дальше, чтобы `await poolPromise` в server.js
        // мог ее поймать или чтобы приложение не запустилось.
        throw err;
    }
})();
 
const cleanup = async () => {
    console.log('Получен сигнал завершения. Закрытие пула соединений SQL Server...');
    try {
        const pool = await poolPromise; // Дожидаемся разрешения промиса
        if (pool && pool.connected) { // Проверяем, что пул создан и подключен
           await pool.close();
           console.log('Пул соединений успешно закрыт.');
        } else {
            console.log('Пул соединений не был подключен или уже закрыт.');
        }
        process.exit(0); // Успешное завершение процесса
    } catch (err) {
        console.error('Ошибка при закрытии пула соединений:', err);
        process.exit(1); // Завершение процесса с кодом ошибки
    }
};


process.on('SIGINT', cleanup); // Сигнал прерывания (например, Ctrl+C)
process.on('SIGTERM', cleanup); // Стандартный сигнал завершения

module.exports = {
    sql,
    poolPromise
};