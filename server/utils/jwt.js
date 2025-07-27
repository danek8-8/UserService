require('dotenv').config(); // Загружает переменные окружения из .env файла
// Получение и проверка секрета для JWT из переменных окружения
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("КРИТИЧЕСКАЯ ОШИБКА: JWT_SECRET не определен в .env файле!");
  process.exit(1); // Завершаем приложение, если секрета нет
}

module.exports = {
    JWT_SECRET,
  };