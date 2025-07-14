<template>
  <div class="login">
    <h2>Авторизация</h2>
    <form @submit.prevent="loginUser" class="login-form">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" v-model="email" required />
      </div>
      <div class="form-group">
        <label for="password">Пароль:</label>
        <input type="password" v-model="password" required />
      </div>
      <button type="submit" class="submit-button">Войти</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    async loginUser() {
      try {
        const response = await axios.post('http://localhost:5000/login', {
          email: this.email,
          password: this.password,
        });
        // Сохраните JWT токен (например, в localStorage) и выполните редирект
        localStorage.setItem('token', response.data.token);

        //const userId = response.data.userId //Вставил код
        //await axios.get(`http://localhost:5000/user/${userId}`); //Вставил код

        // Перенаправление на страницу входа после успешной регистрации
        this.$router.push('/main');
      } catch (error) {
        // *** ИЗМЕНЕНО: Улучшенная обработка ошибок ***
        this.errorMessage = error.response?.data?.message // Сообщение от сервера (предпочтительно)
                          ||error.response?.data // Любые данные ошибки от сервера
                          || 'Ошибка сети или сервера при авторизации.'; // Общее сообщение
      }
    },
  },
};
</script>

<style scoped>
.login {
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

.login-form {
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

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
}

input:focus {
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
}
</style>