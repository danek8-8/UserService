<template>
  <div>
    <h1>Список пользователей</h1>
    <form @submit.prevent="fetchUserById"> <!-- Используем @submit и предотвращаем стандартное поведение -->
      <input type="text" v-model="searchId" placeholder="Введите ID пользователя"/>
      <button type="submit">Поиск</button> <!-- Заменили на type="submit" -->
    </form>
    <table class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>ФИО</th>
          <th>Email</th>
          <th>Роль</th>
          <th>Дата рождения</th>
          <th>Активность</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.UserId">
          <td>{{ user.UserId }}</td>
          <td>{{ user.FullName }}</td>
          <td>{{ user.Email }}</td>
          <td>{{ user.Role }}</td>
          <td>{{ user.DateOfBirth }}</td>
          <td>{{ user.IsActive ? 'Да' : 'Нет' }}</td>
          <td>
            <button @click="blockUser()" class="block-button">Заблокировать</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      searchId: '',
      errorMessage: '',
      users: [],
    };
  },
  methods: {
    async fetchUsers() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userData = response.data.users;
        this.users = userData;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Ошибка при получении списка пользователей.';
      }
    },
    async fetchUserById() {
      if (!this.searchId) {
        this.errorMessage = 'Пожалуйста, введите ID пользователя для поиска.';
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Очистите текущий список пользователей и добавьте найденного пользователя
        this.users = [response.data.users];
        this.errorMessage = '';
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Ошибка при поиске пользователя.';
      }
    },
    async blockUser() {
      try {
        const token = localStorage.getItem('token');
        await axios.patch(`http://localhost:5000/user/block`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.fetchUsers(); // Обновляем список пользователей после блокировки
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Ошибка при блокировке пользователя.';
      }
    }
  },
  created() {
    this.fetchUsers();
  }
};
</script>

<style scoped>
.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.user-table th,
.user-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.user-table th {
  background-color: #f2f2f2;
}

.error-message {
  color: red;
  margin-top: 20px;
}

.block-button {
  background-color: #f44336; /* Красный */
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 5px;
}

.block-button:hover {
  background-color: #d32f2f; /* Более темный красный при наведении */
}
</style>
