import { createRouter, createWebHistory } from 'vue-router';
import PrayerTimes from '../components/PrayerTimes.vue';
import MosqueDetail from '../views/MosqueDetail.vue';

const routes = [
  { path: '/', name: 'Home', component: PrayerTimes },
  { path: '/mosque/:mosque_id', name: 'MosqueDetail', component: MosqueDetail }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
