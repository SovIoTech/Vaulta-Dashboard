// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from "react";
import authService from "../services/auth.service.js";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        const userDetails = await authService.getUserDetails();
        setUser(userDetails);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth check error:", err);
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const result = await authService.signOut();
      if (result.success) {
        setUser(null);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Sign out error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserRole = useCallback(async () => {
    try {
      return await authService.getUserRole();
    } catch (err) {
      console.error("Get user role error:", err);
      return null;
    }
  }, []);

  const isAdmin = useCallback(async () => {
    try {
      return await authService.isAdmin();
    } catch (err) {
      console.error("Check admin error:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    error,
    signOut,
    getUserRole,
    isAdmin,
    checkAuth,
    isAuthenticated: !!user,
  };
};

export default useAuth;
