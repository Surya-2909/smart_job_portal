import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [username, setUsername] = useState("");
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState("");
  const [recentJobs] = useState(() => {
    try {
      const saved = sessionStorage.getItem("recentJobs");
      if (saved) {
        const jobs = JSON.parse(saved);
        if (Array.isArray(jobs) && jobs.length > 0) return jobs;
      }
      const selected = sessionStorage.getItem("selectedJob");
      return selected ? [JSON.parse(selected)] : [];
    } catch (error) {
      console.error("Could not read recent jobs:", error);
      return [];
    }
  });

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", { credentials: "include" })
      .then(async (response) => {
        if (response.status === 401) return null;
        if (!response.ok) throw new Error("Unable to load your account.");
        return response.json();
      })
      .then((account) => {
        if (active && account) setUsername(account.username);
      })
      .catch((error) => {
        if (active) setAccountError(error.message);
      })
      .finally(() => {
        if (active) setAccountLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="dashboard-page">
      <header className="dashboard-heading">
        <span className="dashboard-eyebrow">YOUR CAREER SPACE</span>
        <h1>{username ? `Welcome, ${username}` : "Your dashboard"}</h1>
        <p>Pick up where you left off and continue your job search.</p>
      </header>

      {accountLoading && <p className="dashboard-notice">Checking your account...</p>}
      {!accountLoading && accountError && (
        <p className="dashboard-notice dashboard-error" role="alert">{accountError}</p>
      )}
      {!accountLoading && !username && !accountError && (
        <section className="dashboard-account">
          <div>
            <h2>Sign in to personalize your portal</h2>
            <p>Your recent job stays in this browser. Sign in to use your account.</p>
          </div>
          <Link to="/login" className="dashboard-primary-link">Sign in</Link>
        </section>
      )}

      <section className="dashboard-shortcuts" aria-label="Career tools">
        <Link to="/jobs" className="dashboard-shortcut">
          <span aria-hidden="true">⌕</span>
          <div><h2>Find jobs</h2><p>Search current opportunities by role and location.</p></div>
          <span aria-hidden="true">→</span>
        </Link>
        <Link to="/companies" className="dashboard-shortcut">
          <span aria-hidden="true">▦</span>
          <div><h2>Explore companies</h2><p>Discover employers from current job listings.</p></div>
          <span aria-hidden="true">→</span>
        </Link>
        <Link to="/resume-analyzer" className="dashboard-shortcut">
          <span aria-hidden="true">▤</span>
          <div><h2>Review your resume</h2><p>Check for skills and get a job-search suggestion.</p></div>
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="dashboard-recent">
        <div className="dashboard-section-heading">
          <div><span className="dashboard-eyebrow">CONTINUE YOUR SEARCH</span><h2>Recently viewed</h2></div>
          <Link to="/jobs">Browse jobs</Link>
        </div>
        {recentJobs.length > 0 ? (
          <div className="dashboard-recent-list">
            {recentJobs.map((job, index) => (
              <article className="recent-job-card" key={job.id || index}>
                <div>
                  <h3>{job.title || "Job opportunity"}</h3>
                  <p>{job.company?.display_name || "Company"} · {job.location?.display_name || "Location not specified"}</p>
                </div>
                <Link to={`/jobs/${job.id || ""}`} state={{ job }}>View job</Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="dashboard-empty">Jobs you open will appear here for this browser session.</p>
        )}
      </section>
    </main>
  );
}

export default Dashboard;