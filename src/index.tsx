import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from "react-router-dom";
import App from './App'
import Home from './pages/home'
import ErrorPage from './pages/errorPage'
import Connected from './pages/connectedPage'
import UserDetails from './pages/userDetails'
import 'bootstrap/dist/css/bootstrap.min.css';
import { userLoader } from './App'
import { loader as contactLoader } from './pages/userDetails'
import { accountLoader } from './pages/connectedPage'
import { createUserAction, editUserAction, deleteUserAction, favUserAction } from './routeActions'

import EditUser from './pages/editUser'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      // will render this element
      element={<App />}
      // when the URL matches this path
      path="/"
      // with this data loaded before rendering
      loader={userLoader}
      // performning this mutation when data is submitted to it
      action={createUserAction}
      // and renders this element in case something went wrong
      errorElement={<ErrorPage />}
    >
      <Route errorElement={<ErrorPage />}>
        <Route index element={<Home />} />
        <Route
          path="contacts/:contactId"
          element={<UserDetails />}
          loader={contactLoader}
          action={favUserAction}
        />
        <Route
          path="contacts/:contactId/edit"
          element={<EditUser />}
          loader={contactLoader}
          action={editUserAction}
        />
        <Route
          path="contacts/:contactId/destroy"
          action={deleteUserAction}
        />
        <Route
          path="tdameritrade"
          element={<Connected />}
          loader={accountLoader}
        />
      </Route>
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
