import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import ChatPage from "../pages/ChatPage";
import LoginPage from "../pages/LoginPage";
import HistoryPage from "../pages/HistoryPage";
import SettingsPage from "../pages/SettingsPage";
import { AppLayout } from "../components/layout/AppLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import NotFounded from "../pages/NotFounded";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/chat" replace />,
          },
          {
            path: "chat",
            element: <ChatPage />,
          },
          {
            path: "history",
            element: <HistoryPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "*",
            element: <NotFounded />,
          },
        ],
      },
    ],
  },
]);
