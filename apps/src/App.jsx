import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import SharedNote from "./pages/SharedNote";
import { useAuthStore } from "./store/auth.store.js";

const ProtectedRoutes = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicOnlyRoutes = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  if (token) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoutes>
              <Auth />
            </PublicOnlyRoutes>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoutes>
              <Auth />
            </PublicOnlyRoutes>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoutes>
              <Home />
            </ProtectedRoutes>
          }
        />
        <Route path="/shared/:token" element={<SharedNote />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
