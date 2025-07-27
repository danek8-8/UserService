import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Profile from '../components/Profile.vue';
import UsersList from '../components/UsersList.vue';

const checkAuthenticated = () => {
  const authenticateToken = localStorage.getItem('authToken');
  
  return authenticateToken !== null && authenticateToken !== '';
};

const checkAdmin = () => {
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken){
    return true

  }
  else {
    return false
  }
};


// Определяем маршруты
const routes = [
  {
    path: '/', // Корневой путь
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login', // Имя для удобной навигации
    component: Login,
    meta: { requiresGuest: true } // Этот маршрут только для неаутентифицированных пользователей
  },
  {
    path: '/register',
    name: 'Register', 
    component: Register,
    meta: { requiresGuest: true } // Этот маршрут только для неаутентифицированных пользователей
  },
  {
    path: '/profile',
    name: 'Profile', // Имя для удобной навигации
    component: Profile,
    meta: { requiresAuth: true } // Этот маршрут требует аутентификации
  },
  {
    path: '/usersList',
    name: 'usersList', 
    component: UsersList,
    meta: { requiresAuth: true, requiresAdmin: true } // Этот маршрут только для администраторов
  },
];

// Создаем роутер
const router = createRouter({
  history: createWebHistory(),
  routes, // маршруты
});


// Глобальный навигационный охранник
router.beforeEach((to, from, next) => {
  const isAuthenticated = checkAuthenticated();
  const isAdmin = checkAdmin();
  
  console.log('isAuthenticated:', isAuthenticated);
  console.log('isAdmin:', isAdmin);

   // Проверка, требует ли маршрут аутентификации
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: 'Login' }); // Перенаправляем на страницу входа
  } else if (to.matched.some(record => record.meta.requiresGuest) && isAuthenticated) {
    next({ name: 'Profile' }); // Перенаправляем аутентифицированного пользователя на профиль
  } else if (to.matched.some(record => record.meta.requiresAdmin) && !isAdmin) {
    next({ name: 'Profile' }); // Перенаправляем неадминистратора на профиль
  } else {
    next(); // В остальных случаях продолжаем навигацию
  }
});

// Экспортируем роутер
export default router;