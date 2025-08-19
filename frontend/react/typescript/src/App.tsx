import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import UserService from "./services/userService";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, type AuthState } from "./store/auth/authSlice";
import { Header, Loading } from "./components";

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const { status: authStatus }: AuthState = useSelector(
    (state: { auth: AuthState }) => state.auth
  );

  useEffect(() => {
    setLoading(true);
    new UserService()
      .getCurrentUser()
      .then((res) => {
        if (res.data.user) {
          dispatch(login(res.data.user));
        } else {
          dispatch(logout());
        }
      })
      .catch(() => {
        // alert("err")
        dispatch(logout());
      })
      .finally(() => setLoading(false));
  }, [authStatus, dispatch]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <ToastContainer />
          <Header />
          <Outlet />
        </>
      )}
    </>
  );
}

export default App;
