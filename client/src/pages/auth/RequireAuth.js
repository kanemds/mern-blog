import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'



const RequireAuth = ({ allowedRoles }) => {

  const location = useLocation()
  const { role } = useAuth()

  const content = (

    allowedRoles.include(role) ? <Outlet />
      :
      <Navigate to='login' state={{ from: location }} replace />
  )

  return content
}

export default RequireAuth

