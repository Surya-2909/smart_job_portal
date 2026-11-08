import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", {
      credentials: "include",
    })
      .then(async (response) => {
        if (response.status === 401) {
          return null;
        }
        if (!response.ok) {
          throw new Error("Unable to load the signed-in account.");
        }
        return response.json();
      })
      .then((account) => {
        if (active) {
          setUser(account);
        }
      })
      .catch((error) => {
        console.error("Authentication status error:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Unable to sign out.");
      }
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          Smart Job Portal
        </Link>

        {/* Navigation Links */}
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/jobs">Jobs</Link>
          <Link to="/companies">Companies</Link>
          <Link to="/interview">AI Interview</Link>
          <Link to="/resume-analyzer">Resume Analyzer</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>

        {/* Authentication */}
        <div className="navbar-auth">
          {user ? (
            <>
              <Link to="/profile">Profile</Link>
              <span className="navbar-username">{user.username}</span>
              <button type="button" className="login-button" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-button">
                Login
              </Link>

              <Link to="/register" className="register-button">
                Register
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;