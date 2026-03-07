import { useDispatch } from "react-redux";
import { getUserData } from "../https";
import { useEffect, useState } from "react";
import { removeUser, setUser } from "../redux/slices/userSlice";
import { useNavigate, useLocation } from "react-router-dom";

const useLoadData = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // Public routes where we don't need to fetch user data
      const publicRoutes = ["/landing", "/auth"];
      const isPublicRoute = publicRoutes.includes(location.pathname);

      // Skip API call on public routes
      if (isPublicRoute) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await getUserData();
        const { _id, name, email, phone, role } = data.data;
        dispatch(setUser({ _id, name, email, phone, role }));
      } catch (error) {
        if (error.response?.status === 401) {
          dispatch(removeUser());

          // Only redirect if not already on a public route
          if (!publicRoutes.includes(location.pathname) && location.pathname !== "/") {
            navigate("/auth");
          }
        } else {
          console.error("Unexpected error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [dispatch, navigate, location.pathname]);

  return isLoading;
};

export default useLoadData;