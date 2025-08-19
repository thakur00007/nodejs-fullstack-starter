import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { Signup, Signin } from "./pages/";
import { AuthLayout } from "./components/";
import { Home } from "./pages/";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route
        path="/signup"
        element={
          <AuthLayout authenicated={false}>
            <Signup />
          </AuthLayout>
        }
      />
      <Route
        path="/signin"
        element={
          <AuthLayout authenicated={false}>
            <Signin />
          </AuthLayout>
        }
      />
    </Route>
  )
);
createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
