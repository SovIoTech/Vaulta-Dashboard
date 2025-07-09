// src/components/layout/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../ui/LoadingSpinner";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const [adminCheck, setAdminCheck] = React.useState(false);
  const [checkingAdmin, setCheckingAdmin] = React.useState(requireAdmin);

  React.useEffect(() => {
    if (requireAdmin && user) {
      setCheckingAdmin(true);
      isAdmin().then((result) => {
        setAdminCheck(result);
        setCheckingAdmin(false);
      });
    }
  }, [requireAdmin, user, isAdmin]);

  if (loading || checkingAdmin) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !adminCheck) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
