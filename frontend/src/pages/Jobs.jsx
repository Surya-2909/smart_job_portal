import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Jobs.css";

async function fetchJobs(searchKeyword, searchLocation) {
  const response = await fetch(
    `/api/jobs?keyword=${encodeURIComponent(searchKeyword)}&location=${encodeURIComponent(searchLocation)}`
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch jobs.");
  }
  return Array.isArray(data) ? data : data.results || [];
}

function Jobs() {
  const [searchParams] = useSearchParams();
  const [initialSearch] = useState(() => ({
    keyword: searchParams.get("keyword") || "",
    location: searchParams.get("location") || "India",
  }));
  const [jobs, setJobs] = useState([]);
  const [keyword, setKeyword] = useState(initialSearch.keyword);
  const [location, setLocation] = useState(initialSearch.location);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [jobType, setJobType] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    let active = true;
    fetchJobs(
      initialSearch.keyword || "software developer",
      initialSearch.location
    )
      .then((jobList) => {
        if (active) setJobs(jobList);
      })
      .catch((err) => {
        if (active) {
          console.error("Job API Error:", err);
          setError(err.message || "Unable to load jobs. Please make sure the Spring Boot backend is running.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [initialSearch.keyword, initialSearch.location]);

  const searchJobs = async () => {
    setLoading(true);
    setError("");

    try {
      setJobs(await fetchJobs(keyword || "software developer", location || "India"));
    } catch (err) {
      console.error("Job API Error:", err);
      setError(err.message || "Unable to load jobs. Please make sure the Spring Boot backend is running.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setJobType([]);
    setLocations([]);
  };

  const toggleJobType = (value) => {
    setJobType((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value]
    );
  };

  const toggleLocation = (value) => {
    setLocations((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value]
    );
  };

  const filteredJobs = jobs.filter((job) => {
    const currentType = (
      job.contract_time || "Full Time"
    ).toLowerCase();

    const currentLocation = (
      job.location?.display_name || ""
    ).toLowerCase();

    const typeMatch =
      jobType.length === 0 ||
      jobType.some((type) =>
        currentType.includes(type.toLowerCase())
      );

    const locationMatch =
      locations.length === 0 ||
      locations.some((item) =>
        currentLocation.includes(item.toLowerCase())
      );

    return typeMatch && locationMatch;
  });

  return (
    <div>
      {/* Page Header */}
      <section className="jobs-header">
        <div>
          <span>JOB OPPORTUNITIES</span>

          <h1>Find your next job</h1>

          <p>
            Search for opportunities that match your
            skills and career goals.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="jobs-search-section">
        <div className="jobs-search">

          <div className="jobs-search-field">
            <span>🔍</span>

            <input
              type="text"
              value={keyword}
              onChange={(e) =>
                setKeyword(e.target.value)
              }
              placeholder="Job title, skills or keywords"
            />
          </div>

          <div className="jobs-search-field">
            <span>📍</span>

            <input
              type="text"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
              placeholder="City, state, or India-wide"
            />
          </div>

          <button onClick={searchJobs}>
            Search
          </button>

        </div>
      </section>

      {/* Main Content */}
      <main className="jobs-content">

        {/* Filters */}
        <aside className="filters">

          <div className="filters-header">
            <h3>Filters</h3>

            <button onClick={clearFilters}>
              Clear
            </button>
          </div>

          <div className="filter-group">

            <h4>Job Type</h4>

            <label>
              <input
                type="checkbox"
                checked={jobType.includes("Full Time")}
                onChange={() =>
                  toggleJobType("Full Time")
                }
              />
              Full Time
            </label>

            <label>
              <input
                type="checkbox"
                checked={jobType.includes("Part Time")}
                onChange={() =>
                  toggleJobType("Part Time")
                }
              />
              Part Time
            </label>

            <label>
              <input
                type="checkbox"
                checked={jobType.includes("Internship")}
                onChange={() =>
                  toggleJobType("Internship")
                }
              />
              Internship
            </label>

          </div>

          <div className="filter-group">

            <h4>Location</h4>

            {[
              "Chennai",
              "Bangalore",
              "Hyderabad",
              "Coimbatore",
            ].map((item) => (
              <label key={item}>

                <input
                  type="checkbox"
                  checked={locations.includes(item)}
                  onChange={() =>
                    toggleLocation(item)
                  }
                />

                {item}

              </label>
            ))}

          </div>

        </aside>

        {/* Job Results */}
        <section className="job-results">

          <div className="results-header">

            <div>
              <h2>Available Jobs</h2>

              <p>
                {loading
                  ? "Searching..."
                  : `${filteredJobs.length} opportunities found`}
              </p>
            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="job-error">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="job-loading">
              Loading jobs...
            </div>
          )}

          {/* No Jobs */}
          {!loading &&
            !error &&
            filteredJobs.length === 0 && (
              <div className="job-loading">
                No jobs found. Try another keyword
                or location.
              </div>
            )}

          {/* Jobs List */}
          <div className="jobs-list">

            {filteredJobs.map((job, index) => {

              const company =
                job.company?.display_name ||
                "Company";

              const jobLocation =
                job.location?.display_name ||
                "Location not specified";

              const salary =
                job.salary_min &&
                job.salary_max
                  ? `₹${Math.round(
                      job.salary_min
                    ).toLocaleString()} - ₹${Math.round(
                      job.salary_max
                    ).toLocaleString()}`
                  : "Salary not specified";

              return (
                <article
                  className="job-list-card"
                  key={job.id || index}
                >

                  <div className="job-company-logo">
                    {company
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="job-main">

                    <div className="job-title-row">

                      <h3>
                        {job.title ||
                          "Job Opportunity"}
                      </h3>

                      <span className="verified">
                        ✓ Verified
                      </span>

                    </div>

                    <p className="job-company">
                      {company}
                    </p>

                    <div className="job-meta">

                      <span>
                        📍 {jobLocation}
                      </span>

                      <span>
                        💰 {salary}
                      </span>

                      <span>
                        💼{" "}
                        {job.contract_time ||
                          "Full Time"}
                      </span>

                    </div>

                    <div className="job-skills">

                      {job.category?.label && (
                        <span>
                          {job.category.label}
                        </span>
                      )}

                    </div>

                  </div>

                  <div className="job-actions">

                    <Link
                      to={`/jobs/${job.id || index}`}
                      state={{ job }}
                    >
                      View Details
                    </Link>

                    {job.redirect_url && (
                      <a
                        href={job.redirect_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Apply Now
                      </a>
                    )
                    }

                  </div>

                </article>
              );
            })}

          </div>

        </section>

      </main>
    </div>
  );
}

export default Jobs;