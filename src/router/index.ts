import { createRouter, createWebHashHistory } from 'vue-router'
import ForecastTab from '@/views/ForecastTab.vue'
import ProfileTab from '@/views/ProfileTab.vue'
import ActionTab from '@/views/ActionTab.vue'
import DataTab from '@/views/DataTab.vue'

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
      component: DataTab,
    },
    {
      path: '/action',
      name: 'action',
      component: ActionTab,
    },
    {
      path: '/forecast',
      name: 'forecast',
      component: ForecastTab,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileTab,
    },
  ],
})

export default router
