import Vue from 'vue'
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import(/* webpackChunkName: "home" */ '../pages/Home.vue')
    },
    {
        path: '/looper',
        name: 'Looper',
        component: () => import(/* webpackChunkName: "home" */ '../pages/Looper.vue')
    },
    {
        path: '/test',
        name: 'Test',
        component: () => import(/* webpackChunkName: "test" */ '../pages/Test.vue')
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export default router;
