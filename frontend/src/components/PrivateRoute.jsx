// src/components/PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute({ allowedRoles }) {
  const token = localStorage.getItem("token"); // check if logged in
  const role = localStorage.getItem("role");   // check user role

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />; // redirect unauthorized
  }

  return <Outlet />; // render child routes
}
