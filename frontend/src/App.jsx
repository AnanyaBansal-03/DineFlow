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
import Header from "./components/shared/Header";
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader";
import OrderDetails from "./pages/OrderDetails";

function Layout() {
  const isLoading = useLoadData();
  const location = useLocation();
  const { isAuth } = useSelector((state) => state.user);

  // Public routes that don't need authentication
  const publicRoutes = ["/landing", "/auth"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Only show loader on protected routes when loading
  if (isLoading && !isPublicRoute) return <FullScreenLoader />;

  // Hide header on public routes
  const hideHeader = publicRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen w-full bg-[#121212] overflow-x-hidden">
      {!hideHeader && <Header />}

      <Routes>
        {/* Root Route */}
        <Route
          path="/"
          element={
            isAuth ? <Navigate to="/home" /> : <Navigate to="/landing" />
          }
        />

        {/* Landing Page */}
        <Route path="/landing" element={<LandingPage />} />

        {/* Auth */}
        <Route
          path="/auth"
          element={isAuth ? <Navigate to="/home" /> : <Auth />}
        />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoutes>
              <Home />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoutes>
              <Orders />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoutes>
              <OrderDetails />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/tables"
          element={
            <ProtectedRoutes>
              <Tables />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoutes>
              <Menu />
            </ProtectedRoutes>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes>
              <Dashboard />
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

function ProtectedRoutes({ children }) {
  const { isAuth } = useSelector((state) => state.user);
  const location = useLocation();

  if (!isAuth) {
    // Save the attempted location for redirect after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;