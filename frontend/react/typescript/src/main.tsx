import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Home from "./components/home/Home.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { Signup, Signin } from "./pages/";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
    </Route>
  )
);
createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
