import { createBrowserRouter } from 'react-router';
import { Home } from './Home';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/projects/absentee-dashboard',
    lazy: async () => {
      const { AbsenteeDashboardPage } = await import('./AbsenteeDashboardPage');
      return { Component: AbsenteeDashboardPage };
    },
  },
]);
