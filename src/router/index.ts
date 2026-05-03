import { createRouter, createWebHashHistory } from 'vue-router'
import ForecastPage from '@/views/ForecastPage.vue'
import Tab1Page from '@/views/Tab1Page.vue'
import Tab2Page from '@/views/Tab2Page.vue'
import Tab4Page from '@/views/Tab4Page.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/profile',
    },
    {
      path: '/overview',
      name: 'overview',
      component: Tab1Page,
    },
    {
      path: '/action',
      name: 'action',
      component: Tab2Page,
    },
    {
      path: '/forecast',
      name: 'forecast',
      component: ForecastPage,
    },
    {
      path: '/profile',
      name: 'profile',
      component: Tab4Page,
    },
  ],
})

export default router
