import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import HRDashboard from "./pages/HRDashboard";
import Navbar from "./components/Navbar";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState(() =>
    localStorage.getItem("user") ? "dashboard" : "login"
  );

  function handleLogin(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setPage("dashboard");
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("login");
  }

  return (
    <div className="app">
      {user ? (
        <>
          <Navbar user={user} onLogout={logout} />
          {user.role === "hr" ? (
            <HRDashboard user={user} />
          ) : (
            <UserDashboard user={user} />
          )}
        </>
      ) : (
        page === "register" ? (
          <Register
            onRegister={handleLogin}
            onSwitch={() => setPage("login")}
          />
        ) : (
          <Login
            onLogin={handleLogin}
            onSwitch={() => setPage("register")}
          />
        )
      )}
    </div>
  );
}