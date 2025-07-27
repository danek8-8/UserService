<template>
  <div class="register">
    <h2>Регистрация</h2>
    <form @submit.prevent="registerUser" class="register-form">
      <div class="form-group">
        <label for="fullName">ФИО:</label>
        <input type="text" v-model="fullName" required />
      </div>
      <div class="form-group">
        <label for="dateOfBirth">Дата рождения:</label>
        <input type="date" v-model="dateOfBirth" required />
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Пароль:</label>
        <input type="password" v-model="password" required />
      </div>
      <div class="form-group">
        <label for="role">Роль:</label>
        <select v-model="role" required>
          <option value="user">Пользователь</option>
          <option value="admin">Администратор</option>
        </select>
      </div>
      <button type="submit" class="submit-button">Зарегистрироваться</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
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
      password: '',
      role: 'user',
      errorMessage: '',
    };
  },
  methods: {
    async registerUser() {
      try {
        const response = await axios.post('http://localhost:5000/api/register', {
          fullName: this.fullName,
          dateOfBirth: this.dateOfBirth,
          email: this.email,
          password: this.password,
          role: this.role,
        });

        if (response.data.errormessage === null && response.data.errormessage === ''){
          // Здесь можно добавить редирект на страницу входа или другую страницу после успешной регистрации
          // Перенаправление на страницу входа после успешной регистрации
          this.$router.push('/login');
        }
        else{
          this.errorMessage = response.data.errormessage;
        }
      } catch (error) {
        // *** ИЗМЕНЕНО: Улучшенная обработка ошибок ***
        this.errorMessage = error.response?.data?.message // Сообщение от сервера (предпочтительно)
                          || error.response?.data // Любые данные ошибки от сервера
                          || 'Ошибка сети или сервера при регистрации.'; // Общее сообщение
      }
    },
  },
};
</script>

<style scoped>
.register {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

h2 {
  text-align: center;
  color: #333;
}

.register-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

input, select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
}

input:focus, select:focus {
  border-color: #007bff;
  outline: none;
}

.submit-button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: #0056b3;
}

.error {
  color: red;
  text-align: center;
  margin-top: 10px;
}
</style>