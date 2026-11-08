import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Home.css";

const featuredJobs = [
  {
    id: "1",
    title: "Full Stack Developer",
    company: { display_name: "Technology Company" },
    location: { display_name: "Bangalore" },
    salary_min: 800000,
    salary_max: 1200000,
    contract_time: "Full Time",
    description: "Build and maintain full-stack applications using Java, Spring Boot, and React.",
  },
  {
    id: "2",
    title: "Data Analyst",
    company: { display_name: "Analytics Company" },
    location: { display_name: "Hyderabad" },
    salary_min: 600000,
    salary_max: 1000000,
    contract_time: "Full Time",
    description: "Analyze business data and create reports using Python, SQL, and Power BI.",
  },
  {
    id: "3",
    title: "React Developer",
    company: { display_name: "Software Company" },
    location: { display_name: "Chennai" },
    salary_min: 700000,
    salary_max: 1100000,
    contract_time: "Full Time",
    description: "Develop responsive web applications using React, JavaScript, and Node.js.",
  },
];

function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("India");

  const searchJobs = (event) => {
    event.preventDefault();
    const params = new URLSearchParams({
      keyword: keyword.trim(),
      location: location.trim() || "India",
    });
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="home-page">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">

          <span className="hero-badge">
            Smart way to find your next job
          </span>

          <h1>
            Find Your
            <span> Next Opportunity</span>
          </h1>

          <p>
            Discover relevant job opportunities based on your skills,
            experience and career interests.
          </p>

          {/* Search */}
          <form className="job-search" onSubmit={searchJobs}>

            <div className="search-field">
              <span>🔍</span>
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Job title, skills or keywords"
              />
            </div>

            <div className="search-field">
              <span>📍</span>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City, state, or India-wide"
              />
            </div>

            <button className="search-button" type="submit">
              Search Jobs
            </button>

          </form>

          <div className="hero-links">
            <span>Popular:</span>
            <Link to="/jobs">Java Developer</Link>
            <Link to="/jobs">React Developer</Link>
            <Link to="/jobs">Data Analyst</Link>
            <Link to="/jobs">Software Engineer</Link>
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="features-section">

        <div className="section-heading">
          <span>WHY SMART JOB PORTAL?</span>
          <h2>Everything you need for your job search</h2>
        </div>

        <div className="feature-grid">

          <div className="feature-card">
            <div className="feature-icon">🔎</div>
            <h3>Smart Job Search</h3>
            <p>
              Search and discover relevant job opportunities
              based on your skills and interests.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Interview</h3>
            <p>
              Prepare for interviews with job-specific questions
              and AI-powered practice.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Resume Analyzer</h3>
            <p>
              Analyze your resume and identify areas that can
              improve your job opportunities.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Relevant Opportunities</h3>
            <p>
              Find opportunities that match your selected
              job role and career goals.
            </p>
          </div>

          <Link to="/profile" className="feature-card profile-feature-card">
            <div className="feature-icon">👤</div>
            <h3>Create Your Profile</h3>
            <p>
              Add your skills, experience, and education to build your job seeker profile.
            </p>
            <span>Build your profile →</span>
          </Link>

        </div>
      </section>

      {/* Featured Jobs */}
      <section className="jobs-section">

        <div className="section-heading">
          <span>OPPORTUNITIES</span>
          <h2>Featured Jobs</h2>
          <p>
            Explore some of the latest opportunities available.
          </p>
        </div>

        <div className="job-grid">

          <div className="job-card">
            <div className="job-top">
              <div className="company-logo">G</div>
              <span className="job-type">Full Time</span>
            </div>

            <h3>Full Stack Developer</h3>
            <p className="company-name">Technology Company</p>

            <div className="job-info">
              <span>📍 Bangalore</span>
              <span>💰 ₹8–12 LPA</span>
            </div>

            <div className="skills">
              <span>Java</span>
              <span>Spring Boot</span>
              <span>React</span>
            </div>

            <Link to="/jobs/1" state={{ job: featuredJobs[0] }} className="view-job">
              View Job →
            </Link>
          </div>

          <div className="job-card">
            <div className="job-top">
              <div className="company-logo">D</div>
              <span className="job-type">Full Time</span>
            </div>

            <h3>Data Analyst</h3>
            <p className="company-name">Analytics Company</p>

            <div className="job-info">
              <span>📍 Hyderabad</span>
              <span>💰 ₹6–10 LPA</span>
            </div>

            <div className="skills">
              <span>Python</span>
              <span>SQL</span>
              <span>Power BI</span>
            </div>

            <Link to="/jobs/2" state={{ job: featuredJobs[1] }} className="view-job">
              View Job →
            </Link>
          </div>

          <div className="job-card">
            <div className="job-top">
              <div className="company-logo">R</div>
              <span className="job-type">Full Time</span>
            </div>

            <h3>React Developer</h3>
            <p className="company-name">Software Company</p>

            <div className="job-info">
              <span>📍 Chennai</span>
              <span>💰 ₹7–11 LPA</span>
            </div>

            <div className="skills">
              <span>React</span>
              <span>JavaScript</span>
              <span>Node.js</span>
            </div>

            <Link to="/jobs/3" state={{ job: featuredJobs[2] }} className="view-job">
              View Job →
            </Link>
          </div>

        </div>

        <div className="all-jobs">
          <Link to="/jobs">View All Jobs →</Link>
        </div>

      </section>

      {/* AI Section */}
      <section className="ai-section">

        <div className="ai-content">
          <span className="ai-label">AI-POWERED INTERVIEW PREPARATION</span>

          <h2>
            Prepare for the interview
            <span> before you apply.</span>
          </h2>

          <p>
            Select the job you are interested in and practice
            relevant aptitude, technical, company and mock
            interview questions.
          </p>

          <Link to="/interview" className="ai-button">
            Start  Interview →
          </Link>
        </div>

      </section>

    </div>
  );
}

export default Home;