import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import Modify from './Modify.jsx'

import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,  
  },
  {
    path: "modify",
    element: <Modify/>
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <RouterProvider router={router} />
);
