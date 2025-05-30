import React from 'react';
import { createBrowserRouter, Outlet, RouteObject } from 'react-router-dom';
// import { Navbar, Footer } from '@/components';
import { Home, Log, Role } from '@/pages';
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
            { path: 'log', element: <Log /> },
            { path: 'form-upload', element: <FormUploadWrapper /> },
            { path: '*', element: <Home /> }
        ]
    }
];

const router = createBrowserRouter(routes);
export default router;