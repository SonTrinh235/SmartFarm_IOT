import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { DataHistory } from './pages/DataHistory.jsx';
import { Assistant } from './pages/Assistant.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'data',
        element: <DataHistory />,
      },
      {
        path: 'assistant',
        element: <Assistant />,
      },
    ],
  },
]);
