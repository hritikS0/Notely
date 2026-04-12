import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "./store/auth.store.js";
import AppSkeleton from "./components/AppSkeleton";
import LandingPage from "./pages/Landing.jsx";

const lazyWithPreload = (factory) => {
  const Component = React.lazy(factory);
  Component.preload = factory;
  return Component;
};

const Home = lazyWithPreload(() => import("./pages/Home"));
const Auth = lazyWithPreload(() => import("./pages/Auth"));
const SharedNote = lazyWithPreload(() => import("./pages/SharedNote"));
const AvatarSelection = lazyWithPreload(() => import("./pages/AvatarSelection"));

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
  useEffect(() => {
    const preload = () => {
      Home.preload();
      SharedNote.preload();
      AvatarSelection.preload();
    };
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(preload);
    } else {
      setTimeout(preload, 300);
    }
  }, []);
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      <Suspense fallback={<AppSkeleton />}>
      <Routes>
        <Route
          path="/"
          element={
            <PublicOnlyRoutes>
              <LandingPage />
            </PublicOnlyRoutes>
          }
        />
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
      <Route
        path="/avatar"
        element={
          <ProtectedRoutes>
            <AvatarSelection />
          </ProtectedRoutes>
        }
      />
        <Route path="/shared/:token" element={<SharedNote />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
     </Suspense>
    </BrowserRouter>
  )
}

export default App
