<template>
  <div>
    <h1>Профиль пользователя</h1>
    <p><strong>ФИО:</strong> {{ fullName }}</p>
    <p><strong>Дата рождения:</strong> {{ dateOfBirth }}</p>
    <p><strong>Email:</strong> {{ email }}</p>
  
    <p><strong>Роль:</strong> {{ role }}</p>
    <p><strong>Активность:</strong> {{ isActive ? 'Да' : 'Нет' }}</p>
    <div v-if="errorMessage" style="color: red;">{{ errorMessage }}</div>
    <button v-if="role === 'admin'" @click="goToUserList">Посмотреть список пользователей</button>
    <button @click="logout">Выйти</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      fullName: '',
      dateOfBirth: '',
      email: '',
      role: '',
      isActive: false,
      errorMessage: ''
    };
  },
  methods: {
    async userProfile() {
      try {
        const token = localStorage.getItem('token'); // Получаем токен из localStorage (или другого хранилища)
        const response = await axios.get(`http://localhost:5000/user`, {
          headers: { Authorization: `Bearer ${token}` } // Передаем токен в заголовке
        });
        
        // Сохраняем данные пользователя в состоянии
        const userData = response.data;
        this.fullName = userData.fullName;
        this.dateOfBirth = userData.dateOfBirth/*.toISOString().split('T')[0]*/;
        this.email = userData.email;
        this.role = userData.role;
        this.isActive = userData.isActive;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Ошибка сети или сервера при получении профиля.';
      }
    },

    goToUserList (){
      this.$router.push('/userList')
    },

    logout () {
      localStorage.removeItem('token');
      this.$router.push('/login')
    }
  },
  created() {
    this.userProfile(); // Загружаем данные при создании компонента
  }
};
</script>

<style scoped>
body {
  font-family: 'Arial', sans-serif; /* Шрифт для всего документа */
  background-color: #f4f4f4; /* Цвет фона */
  margin: 0; /* Убираем отступы */
  padding: 20px; /* Отступы */
}

h1 {
  text-align: center; /* Центрирование заголовка */
  color: #333; /* Темный цвет текста заголовка */
}

div {
  max-width: 600px; /* Максимальная ширина контейнера */
  margin: 0 auto; /* Центрирование контейнера */
  padding: 20px; /* Внутренние отступы */
  background-color: #fff; /* Цвет фона блока */
  border-radius: 8px; /* Закругление углов */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Тень блока */
}

p {
  font-size: 16px; /* Размер шрифта для текста */
  line-height: 1.5; /* Межстрочный интервал */
  color: #555; /* Цвет текста для параграфов */
}

strong {
  color: #007BFF; /* Цвет для выделенных заголовков */
}

button {
  display: block; /* Кнопка занимает всю ширину */
  width: 100%; /* Ширина кнопки */
  padding: 10px; /* Внутренние отступы кнопки */
  margin-top: 20px; /* Отступ сверху */
  background-color: #007BFF; /* Цвет фона кнопки */
  color: white; /* Цвет текста кнопки */
  border: none; /* Убираем границу */
  border-radius: 4px; /* Закругление углов кнопки */
  cursor: pointer; /* Курсор при наведении */
  font-size: 16px; /* Размер шрифта для кнопки */
}

button:hover {
  background-color: #0056b3; /* Цвет фона кнопки при наведении */
}

.error {
  color: red; /* Цвет текста ошибки */
  font-weight: bold; /* Жирный шрифт для текста ошибки */
}
</style>