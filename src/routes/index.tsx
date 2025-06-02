import React from 'react';
import { createBrowserRouter, Outlet, RouteObject } from 'react-router-dom';
import { Home, Log, Role, Result } from '@/pages';
import TestModel from '@/pages/TestModel';
import { FormUploadWrapper, FormUploadWrapper2 } from '@/wrappers/FormUploadWrapper';
import { RouteGuard } from '@/components';

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
            { 
                path: 'log/:id', 
                element: (
                    <RouteGuard requiredPath="log">
                        <Log />
                    </RouteGuard>
                ) 
            },
            { 
                path: 'result/:id', 
                element: (
                    <RouteGuard requiredPath="result">
                        <Result />
                    </RouteGuard>
                ) 
            },
            { 
                path: 'form/:id', 
                element: (
                    <RouteGuard requiredPath="form-upload">
                        <FormUploadWrapper />
                    </RouteGuard>
                ) 
            },
            { 
                path: 'form2/:id', 
                element: (
                    <RouteGuard requiredPath="form-upload">
                        <FormUploadWrapper2 />
                    </RouteGuard>
                ) 
            },
            { 
                path: 'test/:id', 
                element: (
                    <RouteGuard requiredPath="test">
                        <TestModel />
                    </RouteGuard>
                ) 
            },
            { path: '*', element: <Home /> }
        ]
    }
];

const router = createBrowserRouter(routes);
export default router;