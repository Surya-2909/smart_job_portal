import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Companies.css";

async function fetchJobs() {
  const response = await fetch(
    "/api/jobs?keyword=software%20developer&location=India"
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to load companies.");
  }
  return Array.isArray(data) ? data : data.results || [];
}

function Companies() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchJobs()
      .then((results) => {
        if (active) setJobs(results);
      })
      .catch((requestError) => {
        if (active) {
          console.error("Companies API error:", requestError);
          setError(requestError.message || "Unable to connect to the jobs service.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    setError("");
    try {
      setJobs(await fetchJobs());
    } catch (requestError) {
      console.error("Companies API error:", requestError);
      setError(requestError.message || "Unable to connect to the jobs service.");
    } finally {
      setLoading(false);
    }
  };

  const companies = useMemo(() => {
    const grouped = new Map();

    for (const job of jobs) {
      const name = job.company?.display_name?.trim();
      if (!name) continue;

      const key = name.toLocaleLowerCase();
      const company = grouped.get(key) || {
        name,
        jobs: [],
        location: job.location?.display_name || "",
      };
      company.jobs.push(job);
      grouped.set(key, company);
    }

    return [...grouped.values()].sort(
      (left, right) => right.jobs.length - left.jobs.length
    );
  }, [jobs]);

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <main className="companies-page">
      <header className="companies-header">
        <span className="companies-eyebrow">EMPLOYERS</span>
        <h1>Discover companies</h1>
        <p>Explore employers hiring for roles in the latest job listings.</p>
        <label className="companies-search">
          <span className="visually-hidden">Search companies</span>
          <input
            type="search"
            placeholder="Search company names"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </header>

      <section className="companies-content" aria-live="polite">
        {loading && <p className="companies-message">Loading companies...</p>}
        {!loading && error && (
          <div className="companies-message companies-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={loadCompanies}>Try again</button>
          </div>
        )}
        {!loading && !error && filteredCompanies.length === 0 && (
          <p className="companies-message">
            {companies.length ? "No companies match your search." : "No company listings were returned. Try again later."}
          </p>
        )}
        {!loading && !error && filteredCompanies.length > 0 && (
          <div className="companies-grid">
            {filteredCompanies.map((company) => (
              <article className="company-card" key={company.name}>
                <div className="company-mark" aria-hidden="true">
                  {company.name.charAt(0).toUpperCase()}
                </div>
                <h2>{company.name}</h2>
                <p>{company.location || "Location not specified"}</p>
                <p className="company-job-count">
                  {company.jobs.length} {company.jobs.length === 1 ? "opening" : "openings"} in current results
                </p>
                <Link
                  to={`/jobs?keyword=${encodeURIComponent(company.name)}`}
                  className="company-jobs-link"
                >
                  Explore opportunities
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Companies;