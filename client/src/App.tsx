import { ReactNode, useEffect } from "react";
import { Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FacilitatorDashboard from "./pages/FacilitatorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import FounderReport from "./pages/FounderReport";
import Discover from "./pages/Discover";
import Settings from "./pages/Settings";
import { Spinner } from "./components/ui/primitives";

const FullPageSpinner = () => (
  <div className="grid min-h-screen place-items-center bg-bg">
    <Spinner />
  </div>
);

const PrivateRoute = ({ children, allowedRoles = [] }: { children: ReactNode; allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const PublicOnlyRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const LegacyProfileRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/f/${slug}`} replace />;
};

const RoleHome = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case "facilitator":
      return <FacilitatorDashboard />;
    case "admin":
      return <AdminDashboard />;
    case "investor":
      return <Navigate to="/discover" replace />;
    default:
      return <Dashboard />;
  }
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

        {/* Public, shareable */}
        <Route path="/f/:slug" element={<FounderReport />} />
        <Route path="/u/:slug" element={<LegacyProfileRedirect />} />
        <Route path="/discover" element={<Discover />} />

        {/* Signed in */}
        <Route path="/dashboard" element={<PrivateRoute><RoleHome /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/profile/:id" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        <Route path="/watchlist" element={<PrivateRoute allowedRoles={["investor", "admin"]}><Discover watchlist /></PrivateRoute>} />
        <Route path="/facilitator" element={<PrivateRoute allowedRoles={["facilitator", "admin"]}><FacilitatorDashboard /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute allowedRoles={["admin"]}><AdminDashboard /></PrivateRoute>} />
        <Route path="/cohort/:id" element={<Navigate to="/dashboard" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
