import { createApp } from 'vue';
import App from './App.vue'; // Импортирует корневой компонент приложения
import router from './router'; // Импортирует настроенный Vue Router


// Создаем экземпляр приложения Vue
const app = createApp(App);

// Регистрируем Vue Router в приложении
app.use(router);

// Монтируем приложение в элемент с id="app" в вашем index.html
app.mount('#app');