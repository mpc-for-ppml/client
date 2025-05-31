import React from 'react';
import { createBrowserRouter, Outlet, RouteObject } from 'react-router-dom';
import { Home, Log, Role, Result } from '@/pages';
import FormUploadWrapper from '@/wrappers/FormUploadWrapper';

const MainLayout: React.FC = () => (
    <>
        <Outlet />
    </>
);

const routes: RouteObject[] = [
    {
        path: '/',
        element: <MainLayout />, 
        children: [
            { index: true, element: <Home /> },
            { path: 'role', element: <Role /> },
            { path: 'log/:id', element: <Log /> },
            { path: 'result/:id', element: <Result /> },
            { path: 'form-upload/:id', element: <FormUploadWrapper /> },
            { path: '*', element: <Home /> }
        ]
    }
];

const router = createBrowserRouter(routes);
export default router;