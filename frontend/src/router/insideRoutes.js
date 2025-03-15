import {
  ArrowRightOutlined,
  BarsOutlined,
  BookOutlined,
  CompassOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  HomeOutlined,
  IdcardOutlined,
  ImportOutlined,
  ProfileOutlined,
  RedditOutlined,
  ScheduleOutlined,
  SearchOutlined,
  SecurityScanOutlined,
  SettingOutlined,
  SolutionOutlined,
  TeamOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { lazy } from 'react';

// Function to check user role visibility
const isUserVisible = roles => {
  const user = localStorage.getItem('user');
  return user ? roles.includes(JSON.parse(user).user_type) : false;
};

export const insideRoutes = [
  {
    path: 'home',
    title: 'Home',
    icon: <HomeOutlined />,
    hidden: !isUserVisible(['ADMIN', 'TEACHER', 'STUDENT', 'ALUMNI', 'GUEST']),
    component: lazy(() => import('@/pages/Home')),
  },
  {
    path: 'campus-essentials',
    title: 'Campus Essentials',
    icon: <CompassOutlined />,
    component: lazy(() => import('@/pages/CampusEssentials')),
  },
  {
    path: 'register',
    title: 'Register Now!',
    icon: <ArrowRightOutlined />,
    hidden: isUserVisible(['ADMIN', 'TEACHER', 'STUDENT', 'ALUMNI', 'GUEST']),
  },
  {
    path: 'course',
    title: 'Course',
    icon: <SolutionOutlined />,
    hidden: !isUserVisible(['ADMIN', 'TEACHER', 'STUDENT', 'ALUMNI', 'GUEST']),
    items: [
      {
        path: '',
        redirect: 'list',
        hidden: true,
      },
      {
        path: 'list',
        title: 'List',
        icon: <BarsOutlined />,
        component: lazy(() => import('@/pages/Course/List')),
      },
      {
        path: 'view',
        title: 'View',
        icon: <EyeOutlined />,
        component: lazy(() => import('@/pages/Course/View')),
        hidden: true,
      },
      {
        path: 'editor',
        title: 'Editor',
        icon: <EditOutlined />,
        component: lazy(() => import('@/pages/Course/Editor')),
        hidden: !isUserVisible(['ADMIN']),
      },
      {
        path: 'import',
        title: 'Import',
        icon: <ImportOutlined />,
        component: lazy(() => import('@/pages/Course/Import')),
        hidden: !isUserVisible(['ADMIN']),
      },
    ],
  },
  {
    path: 'section',
    title: 'Course Section',
    icon: <ScheduleOutlined />,
    hidden: !isUserVisible(['ADMIN', 'TEACHER', 'STUDENT', 'ALUMNI', 'GUEST']),
    items: [
      {
        path: '',
        redirect: 'list',
        hidden: true,
      },
      {
        path: 'list',
        title: 'List',
        icon: <BarsOutlined />,
        component: lazy(() => import('@/pages/Section/List')),
      },
      {
        path: 'view',
        title: 'View',
        icon: <EyeOutlined />,
        component: lazy(() => import('@/pages/Section/View')),
        hidden: true,
      },
      {
        path: 'editor',
        title: 'Editor',
        icon: <EditOutlined />,
        component: lazy(() => import('@/pages/Section/Editor')),
        hidden: !isUserVisible(['ADMIN']),
      },
    ],
  },
  {
    path: 'teachers',
    title: 'Teachers',
    icon: <TeamOutlined />,
    hidden: !isUserVisible(['ADMIN']),
    items: [
      {
        path: '',
        redirect: 'import',
        hidden: true,
      },
      {
        path: 'import',
        title: 'Import',
        icon: <ImportOutlined />,
        component: lazy(() => import('@/pages/Teacher/Import')),
      },
    ],
  },

  {
    path: 'datasets',
    title: 'Knowledge Base',
    icon: <BookOutlined />,
    hidden: !isUserVisible(['ADMIN']),
    items: [
      {
        path: '',
        redirect: 'list',
        hidden: true,
      },
      {
        path: 'list',
        title: 'Datasets',
        icon: <BarsOutlined />,
        component: lazy(() => import('@/pages/Dataset/List')),
      },
      {
        path: 'documents',
        title: 'Documents',
        icon: <FileTextOutlined />,
        component: lazy(() => import('@/pages/Dataset/Documents')),
      },
      {
        path: 'uploader',
        title: 'Uploader',
        icon: <UploadOutlined />,
        component: lazy(() => import('@/pages/Dataset/Uploader')),
      },
    ],
  },
  {
    path: 'forum',
    title: 'Forum',
    icon: <RedditOutlined />,
    hidden: !isUserVisible(['ADMIN', 'TEACHER', 'STUDENT', 'ALUMNI', 'GUEST']),
    items: [
      {
        path: '',
        redirect: 'list',
        hidden: true,
      },
      {
        path: 'list',
        title: 'List',
        icon: <BarsOutlined />,
        component: lazy(() => import('@/pages/Forum/List')),
      },
      {
        path: 'search',
        title: 'Search',
        icon: <SearchOutlined />,
        component: lazy(() => import('@/pages/Forum/Search')),
      },
      {
        path: 'view',
        title: 'View',
        icon: <EyeOutlined />,
        hidden: true,
        component: lazy(() => import('@/pages/Forum/View')),
      },
      {
        path: 'thread-editor',
        title: 'Thread Editor',
        icon: <EditOutlined />,
        hidden: true,
        component: lazy(() => import('@/pages/Forum/ThreadEditor')),
      },
      {
        path: 'reply-editor',
        title: 'Reply Editor',
        icon: <EditOutlined />,
        hidden: true,
        component: lazy(() => import('@/pages/Forum/ReplyEditor')),
      },
    ],
  },
  {
    path: 'profile',
    title: 'Profile',
    icon: <ProfileOutlined />,
    hidden: !isUserVisible(['ADMIN', 'TEACHER', 'STUDENT', 'ALUMNI', 'GUEST']),
    items: [
      {
        path: '',
        redirect: 'user-information',
        hidden: true,
      },
      {
        path: 'user-information',
        title: 'User Information',
        icon: <IdcardOutlined />,
        component: lazy(() => import('@/pages/Profile/UserInformation')),
      },
      {
        path: 'change-password',
        title: 'Change Password',
        icon: <SecurityScanOutlined />,
        component: lazy(() => import('@/pages/Profile/ChangePassword')),
      },
    ],
  },
  {
    path: 'management',
    title: 'Management',
    icon: <SettingOutlined />,
    hidden: !isUserVisible(['ADMIN']),
    items: [
      {
        path: '',
        redirect: 'users',
        hidden: true,
      },
      {
        path: 'users',
        title: 'Users',
        icon: <TeamOutlined />,
        component: lazy(() => import('@/pages/Management/Users')),
      },
    ],
  },
  {
    path: '*',
    title: '404',
    component: lazy(() => import('@/common/NotFound')),
    hidden: true,
  },
];
