function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      {/* Website Logo */}
      <div className="logo">
        CareerConnect
      </div>

      {/* Navigation Links */}
      <div className="nav-links">
        <span className="nav-welcome">
          Welcome, {user?.name || "User"}
        </span>

        {user?.role === "hr" ? (
          <span className="nav-role">HR Dashboard</span>
        ) : (
          <span className="nav-role">Student Dashboard</span>
        )}

        <button
          type="button"
          className="nav-logout"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;