import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./JobDetails.css";

function getSavedJob() {
  try {
    const savedJob = sessionStorage.getItem("selectedJob");
    return savedJob ? JSON.parse(savedJob) : null;
  } catch (error) {
    console.error("Failed to load saved job:", error);
    return null;
  }
}

function JobDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job || getSavedJob();

  useEffect(() => {
    if (location.state?.job) {
      try {
        const selectedJob = location.state.job;
        sessionStorage.setItem("selectedJob", JSON.stringify(selectedJob));
        const savedRecentJobs = JSON.parse(sessionStorage.getItem("recentJobs") || "[]");
        const recentJobs = Array.isArray(savedRecentJobs) ? savedRecentJobs : [];
        sessionStorage.setItem(
          "recentJobs",
          JSON.stringify([
            selectedJob,
            ...recentJobs.filter((item) => item.id !== selectedJob.id),
          ].slice(0, 5))
        );
      } catch (error) {
        console.error("Failed to save recent job:", error);
      }
    }
  }, [location.state]);

  if (!job) {
    return (
      <div className="job-not-found">
        <h2>Job details not available</h2>

        <p>
          Please return to the Jobs page and select
          a job again.
        </p>

        <Link
          to="/jobs"
          className="back-to-jobs"
        >
          ← Back to Jobs
        </Link>
      </div>
    );
  }

  const title =
    job.title || "Job Opportunity";

  const company =
    job.company?.display_name ||
    "Company";

  const jobLocation =
    job.location?.display_name ||
    "Location not specified";

  const description =
    job.description ||
    "No job description available.";

  const salary =
    job.salary_min &&
    job.salary_max
      ? `₹${Math.round(
          job.salary_min
        ).toLocaleString()} - ₹${Math.round(
          job.salary_max
        ).toLocaleString()}`
      : "Salary not specified";

  const jobType =
    job.contract_time || "Full Time";

  const officialUrl =
    job.redirect_url || "";

  return (
    <div className="job-details-page">

      {/* Header */}
      <section className="job-details-header">

        <div className="job-details-container">

          <button
            className="back-link"
            onClick={() => navigate("/jobs")}
          >
            ← Back to Jobs
          </button>

          <div className="job-header-content">

            <div className="details-company-logo">
              {company
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="job-header-info">

              <div className="title-line">

                <h1>{title}</h1>

                <span className="verified-badge">
                  ✓ Verified Opportunity
                </span>

              </div>

              <p className="details-company">
                {company}
              </p>

              <div className="details-meta">

                <span>
                  📍 {jobLocation}
                </span>

                <span>
                  💰 {salary}
                </span>

                <span>
                  💼 {jobType}
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* Main */}
      <main className="job-details-container details-layout">

        {/* Left */}
        <section className="job-description">

          {/* Job Description */}
          <div className="details-section">

            <h2>Job Description</h2>

            <div
              className="description-content"
              dangerouslySetInnerHTML={{
                __html: description,
              }}
            />

          </div>

          {/* Job Information */}
          <div className="details-section">

            <h2>Job Information</h2>

            <div className="job-info-grid">

              <div>
                <strong>Job Title</strong>
                <span>{title}</span>
              </div>

              <div>
                <strong>Company</strong>
                <span>{company}</span>
              </div>

              <div>
                <strong>Location</strong>
                <span>{jobLocation}</span>
              </div>

              <div>
                <strong>Job Type</strong>
                <span>{jobType}</span>
              </div>

              <div>
                <strong>Salary</strong>
                <span>{salary}</span>
              </div>

            </div>

          </div>

          {/* About */}
          <div className="details-section">

            <h2>About this opportunity</h2>

            <p>
              This job was retrieved through the
              Smart Job Portal job API.
            </p>

            <p>
              Please verify the final job information
              on the official employer or job-provider
              website before applying.
            </p>

          </div>

        </section>

        {/* Right */}
        <aside className="apply-card">

          <h3>
            Interested in this job?
          </h3>

          <p>
            Apply through the official job source
            or prepare for your interview.
          </p>

          {/* Official Application */}
          {officialUrl && (
            <a
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="apply-button"
            >
              Apply on Official Website
            </a>
          )}

          {/* Interview */}
          <Link
            to={`/interviews/${job.id || ""}`}
            state={{ job }}
            className="interview-button"
          >
            Prepare for Interview
          </Link>

        </aside>

      </main>

    </div>
  );
}

export default JobDetails;