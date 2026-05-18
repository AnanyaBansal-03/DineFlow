import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  LandingPage,
  Home,
  Auth,
  Orders,
  Tables,
  Menu,
  Dashboard,
} from "./pages"; 
import More from "./pages/More";
import Header from "./components/shared/Header";
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader";
import OrderDetails from "./pages/OrderDetails";
import Kitchen from "./pages/kitchen/Kitchen";
import { SocketProvider } from "./context/SocketContext";
import WaiterDashboard from "./pages/WaiterDashboard";
import { NotificationProvider } from "./context/NotificationContext";
import Notifications from "./pages/Notifications"; // ✅ ADD THIS IMPORT

function Layout() {
  const isLoading = useLoadData();
  const location = useLocation();
  const { isAuth, role } = useSelector((state) => state.user);

  // Public routes that don't need authentication
  const publicRoutes = ["/landing", "/auth"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Only show loader on protected routes when loading
  if (isLoading && !isPublicRoute) return <FullScreenLoader />;

  // Hide header on public routes
  const hideHeader = publicRoutes.includes(location.pathname);

  // Helper to get default redirect based on role
  const getDefaultRedirect = () => {
    if (role === "Kitchen") return "/kitchen";
    if (role === "Waiter") return "/waiter";
    return "/home";
  };

  return (
    <div className="min-h-screen w-full bg-[#121212] overflow-x-hidden">
      {!hideHeader && <Header />}

      <Routes>
        {/* Root Route */}
        <Route
          path="/"
          element={
            isAuth ? <Navigate to={getDefaultRedirect()} /> : <Navigate to="/landing" />
          }
        />

        {/* Landing Page */}
        <Route path="/landing" element={<LandingPage />} />

        {/* Auth */}
        <Route
          path="/auth"
          element={isAuth ? <Navigate to={getDefaultRedirect()} /> : <Auth />}
        />

        <Route
          path="/more"
          element={
            <ProtectedRoutes>
              <More />
            </ProtectedRoutes>
          }
        />

        {/* Waiter Dashboard Route */}
        <Route
          path="/waiter"
          element={
            <ProtectedRoutes allowedRoles={["Waiter", "Admin"]}>
              <WaiterDashboard />
            </ProtectedRoutes>
          }
        />

        {/* ✅ NOTIFICATIONS ROUTE - ADD THIS */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoutes>
              <Notifications />
            </ProtectedRoutes>
          }
        />

        {/* Protected Routes with Role-Based Access */}
        <Route
          path="/home"
          element={
            <ProtectedRoutes allowedRoles={["Waiter", "Admin", "Kitchen"]}>
              <Home />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoutes allowedRoles={["Waiter", "Admin"]}>
              <Orders />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoutes allowedRoles={["Waiter", "Admin"]}>
              <OrderDetails />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/tables"
          element={
            <ProtectedRoutes allowedRoles={["Waiter", "Admin"]}>
              <Tables />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoutes allowedRoles={["Waiter", "Admin"]}>
              <Menu />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes allowedRoles={["Admin"]}>
              <Dashboard />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/kitchen"
          element={
            <ProtectedRoutes allowedRoles={["Kitchen", "Admin"]}>
              <Kitchen />
            </ProtectedRoutes>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="text-white text-center mt-20">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </div>
  );
}

// ProtectedRoutes with role-based access control
function ProtectedRoutes({ children, allowedRoles = [] }) {
  const { isAuth, role } = useSelector((state) => state.user);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If route has role restrictions, check if user's role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    console.log(`❌ Access denied: ${role} cannot access ${location.pathname}`);
    // Redirect based on role
    if (role === "Kitchen") {
      return <Navigate to="/kitchen" replace />;
    } else if (role === "Waiter") {
      return <Navigate to="/waiter" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}

function App() {
  return (
    <SocketProvider>
      <NotificationProvider>
        <Router>
          <Layout />
        </Router>
      </NotificationProvider>
    </SocketProvider>
  );
}

export default App;