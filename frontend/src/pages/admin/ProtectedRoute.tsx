import { Navigate } from "react-router-dom";

type Props = {
  children: JSX.Element;
  allowedRoles: string[];
};

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const token = localStorage.getItem("admin_token");
  const role = localStorage.getItem("admin_role"); // make sure you set this on login

  if (!token || !role || !allowedRoles.includes(role)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
