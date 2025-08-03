import { createRouter, createWebHistory } from 'vue-router';
import PrayerTimes from '../components/PrayerTimes.vue';
import MosqueDetail from '../views/MosqueDetail.vue';
import NearbyMosques from '../views/NearbyMosques.vue';

const routes = [
  { path: '/', name: 'Home', component: PrayerTimes },
  { path: '/mosque/:mosque_id', name: 'MosqueDetail', component: MosqueDetail },
  { path: '/nearby-mosque', name: 'NearbyMosques', component: NearbyMosques }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
