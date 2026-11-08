import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/login";
import Register from "./pages/Register";

import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";

import Interview from "./pages/Interview";

import Companies from "./pages/Companies";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";

function App() {
  return (
    <BrowserRouter>

      {/* Navigation */}
      <Navbar />

      <Routes>

        {/* =========================
            HOME
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* =========================
            AUTHENTICATION
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            JOBS
        ========================= */}

        <Route
          path="/jobs"
          element={<Jobs />}
        />

        <Route
          path="/jobs/:id"
          element={<JobDetails />}
        />


        {/* =========================
            AI INTERVIEW
        ========================= */}

        <Route
          path="/interview"
          element={<Interview />}
        />

        <Route
          path="/interview/:id"
          element={<Interview />}
        />

        {/* Also support plural URL */}
        <Route
          path="/interviews"
          element={<Interview />}
        />

        <Route
          path="/interviews/:id"
          element={<Interview />}
        />


        {/* =========================
            COMPANIES
        ========================= */}

        <Route
          path="/companies"
          element={<Companies />}
        />


        {/* =========================
            DASHBOARD
        ========================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* =========================
            PROFILE
        ========================= */}

        <Route
          path="/profile"
          element={<Profile />}
        />


        {/* =========================
            RESUME ANALYZER
        ========================= */}

        <Route
          path="/resume-analyzer"
          element={<ResumeAnalyzer />}
        />


        {/* =========================
            PAGE NOT FOUND
        ========================= */}

        <Route
          path="*"
          element={
            <div
              style={{
                padding: "80px 20px",
                textAlign: "center",
              }}
            >
              <h1>404</h1>

              <p>
                Page not found.
              </p>
            </div>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;