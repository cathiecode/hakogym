import React from 'react'
import ReactDOM from 'react-dom'
import "ress"
import './index.css'
import { RouterProvider } from 'react-router'
import { createBrowserRouter } from 'react-router-dom'

import StartPage from './pages/StartPage'
import StatusPage from './pages/StatusPage'

const router = createBrowserRouter([
  {
    path: "/",
    element: <StartPage />
  },
  {
    path: "/status",
    element: <StatusPage />
  }
])

ReactDOM.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
   document.getElementById('root')
)
