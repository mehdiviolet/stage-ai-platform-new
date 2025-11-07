// App.tsx
import { useEffect } from "react";
import { Navigate, RouterProvider, useNavigate } from "react-router-dom";
import { router } from "./routes/index";
import { checkAuth } from "./features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "./app/hooks";

export default function App() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  // const navigate = useNavigate();

  useEffect(() => {
    // Al mount controlla se c'è token e carica user
    const token = localStorage.getItem("token");
    if (token) {
      console.log(token);

      dispatch(checkAuth());
    }
  }, [dispatch]);

  return <RouterProvider router={router} />;
}
