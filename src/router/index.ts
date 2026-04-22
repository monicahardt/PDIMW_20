import { createRouter, createWebHashHistory } from 'vue-router'
import AboutPage from '@/views/AboutPage.vue'
import HomePage from '@/views/HomePage.vue'
import VisualizationsPage from '@/views/VisualizationsPage.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/visualizations',
      name: 'visualizations',
      component: VisualizationsPage,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutPage,
    },
  ],
})

export default router
