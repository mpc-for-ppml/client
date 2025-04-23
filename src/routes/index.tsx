import React from 'react';
import { createBrowserRouter, Outlet, RouteObject } from 'react-router-dom';
import { Navbar, Footer } from '@/components';
import { Home } from '@/pages/Home';
import FormUploadWrapper from '@/wrappers/FormUploadWrapper';

const MainLayout: React.FC = () => (
    <>
        <Navbar />
        <Outlet />
        <Footer />
    </>
);

const routes: RouteObject[] = [
    {
        path: '/',
        element: <MainLayout />, 
        children: [
            { index: true, element: <Home /> },
            { path: 'form-upload', element: <FormUploadWrapper /> },
            { path: '*', element: <Home /> }
        ]
    }
];

const router = createBrowserRouter(routes);
export default router;