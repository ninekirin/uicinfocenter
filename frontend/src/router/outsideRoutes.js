import { CompassOutlined } from '@ant-design/icons';
import { lazy } from 'react';
export const outsideRoutes = [
  {
    path: '/',
    redirect: localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')).default_entrypoint
        ? JSON.parse(localStorage.getItem('user')).default_entrypoint
        : 'home'
      : 'login',
    hidden: true,
  },
  {
    path: 'chat',
    title: 'Chat',
    meta: { title: '', roles: [] },
    items: [
      {
        path: '',
        title: 'Chat',
        meta: { title: '', roles: [] },
        component: lazy(() => import('@/pages/Chat')),
      },
      {
        path: 'share',
        title: 'Shared Chat',
        meta: { title: '', roles: [] },
        component: lazy(() => import('@/pages/Chat/Shared')),
      },
    ],
  },
  {
    path: 'chat-demo',
    title: 'ChatDemo',
    meta: { title: '', roles: [] },
    component: lazy(() => import('@/pages/ChatDemo')),
  },
  {
    path: '/login',
    title: 'Login',
    meta: { title: '', roles: [] },
    component: lazy(() => import('@/pages/Auth/Login')),
  },
  {
    path: '/register',
    title: 'Register',
    meta: { title: '', roles: [] },
    component: lazy(() => import('@/pages/Auth/Register')),
  },
  {
    path: '/register-old',
    title: 'Register',
    meta: { title: '', roles: [] },
    component: lazy(() => import('@/pages/Auth/RegisterOld')),
  },
];
