import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';



// Определяем маршруты
const routes = [
  {
    path: '/', // Корневой путь
    // Редирект будет обрабатываться навигационным стражем ниже.
    // Можно оставить редирект на логин как запасной вариант,
    // или определить компонент для главной страницы, если она есть.
    redirect: '/login'
  },
  {
    path: '/login',
    // *** ДОБАВЛЕНО: Имя и мета-поле ***
    name: 'Login', // Имя для удобной навигации
    component: Login,
    meta: { guestOnly: true } // Этот маршрут только для неаутентифицированных пользователей
  },
  {
    path: '/register',
    // *** ДОБАВЛЕНО: Имя и мета-поле ***
    name: 'Register', 
    // Имя для удобной навигации
    component: () => import(/* webpackChunkName: "register" */ '../components/Register'),
    meta: { guestOnly: true } // Этот маршрут только для неаутентифицированных пользователей
  },
  {
    path: '/main',
    // *** ДОБАВЛЕНО: Имя и мета-поле ***
    name: 'Main', // Имя для удобной навигации
    component: () => import(/* webpackChunkName: "main" */ '../components/Main'),
    meta: { requiresAuth: true } // Этот маршрут требует аутентификации
  },
  {
    path: '/userList',
    // *** ДОБАВЛЕНО: Имя и мета-поле ***
    name: 'userList', 
    // Имя для удобной навигации
    component: () => import(/* webpackChunkName: "register" */ '../components/UsersList'),
    meta: { requiresAuth: true, adminOnly: true } // Этот маршрут только для администраторов
  },
];

// Создаем роутер
const router = createRouter({
  history: createWebHistory(),
  routes, // маршруты
});

// Функция для декодирования JWT
/*function decodeJWT(token) {
  if (!token) return null;
  
  const payload = token.split('.')[1]; // Получаем часть Payload
  const decodedPayload = JSON.parse(atob(payload)); // Декодируем Base64

  return decodedPayload; // Возвращаем декодированную полезную нагрузку
}*/

// Глобальный навигационный охранник
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token; // Проверка токена
  //const userRole = JSON.parse(localStorage.getItem('user'))?.role;
  /*let userRole;

  if (isAuthenticated) {
    const decodedToken = decodeJWT(token); // Используем нашу функцию для декодирования токена
    userRole = decodedToken?.role; // Извлекаем роль пользователя из декодированного токена
  }*/
  

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Если путь требует аутентификации и токен отсутствует, перенаправляем на /login
    next({ name: 'Login' });
  } else if (to.meta.guestOnly && isAuthenticated) {
    // Если пользователь аутентифицирован, перенаправляем его на /main
    next({ name: 'Main' });
  } /*else if (to.meta.adminOnly && (userRole !== 'admin')){
    next({ name: 'Main' });
  }*/ else {
    // В остальных случаях продолжаем навигацию
    next();
  }
});

// Экспортируем роутер
export default router;