import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { readApiResponse } from "../utils/readApiResponse";
import "./Profile.css";

const emptyProfile = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  headline: "",
  skills: "",
  experience: "",
  education: "",
};

const getRequestErrorMessage = (error, fallback) =>
  error instanceof TypeError
    ? "Unable to connect to the server. Check that the backend is running, then try again."
    : error.message || fallback;

function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        const data = await readApiResponse(response);
        if (response.status === 401) {
          if (active) setSignedIn(false);
          return;
        }
        if (!response.ok) {
          throw new Error(data?.message || "Unable to load your profile.");
        }
        if (active) {
          setProfile({
            ...emptyProfile,
            ...Object.fromEntries(
              Object.keys(emptyProfile).map((key) => [key, data?.[key] || ""])
            ),
          });
          setSignedIn(true);
        }
      } catch (requestError) {
        if (active) {
          setError(getRequestErrorMessage(requestError, "Unable to load your profile."));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [loadAttempt]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch("/api/auth/me", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await readApiResponse(response);
      if (response.status === 401) {
        setSignedIn(false);
        throw new Error(data?.message || "Please sign in again to update your profile.");
      }
      if (!response.ok) {
        throw new Error(data?.message || "Unable to save your profile.");
      }
      setProfile((current) => ({ ...current, ...data }));
      setSuccess("Your profile has been saved.");
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, "Unable to save your profile."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="profile-page">
        <p className="profile-status" role="status">Loading your profile...</p>
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className="profile-page">
        <section className="profile-card profile-sign-in">
          <span className="profile-eyebrow">JOB SEEKER PROFILE</span>
          <h1>{error ? "Unable to load your profile" : "Sign in to create your profile"}</h1>
          <p>
            {error
              ? "Your profile service could not be reached. Please try again."
              : "Your profile details are saved securely to your account."}
          </p>
          {error && <p className="profile-error" role="alert">{error}</p>}
          <div className="profile-actions">
            {error ? (
              <button
                type="button"
                className="profile-submit"
                onClick={() => {
                  setLoading(true);
                  setError("");
                  setLoadAttempt((attempt) => attempt + 1);
                }}
              >
                Try again
              </button>
            ) : (
              <Link to="/login" className="profile-submit">Sign in</Link>
            )}
            <Link to="/register" className="profile-secondary">Create an account</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <header className="profile-heading">
        <span className="profile-eyebrow">JOB SEEKER PROFILE</span>
        <h1>Your professional profile</h1>
        <p>Add details employers can use to understand your experience and strengths.</p>
      </header>

      <form className="profile-card profile-form" onSubmit={handleSubmit}>
        <section className="profile-section">
          <h2>Personal details</h2>
          <div className="profile-fields">
            <label>
              Full name *
              <input
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                maxLength={100}
                autoComplete="name"
                required
              />
            </label>
            <label>
              Email address *
              <input
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                maxLength={254}
                autoComplete="email"
                required
              />
            </label>
            <label>
              Phone
              <input
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleChange}
                maxLength={30}
                autoComplete="tel"
              />
            </label>
            <label>
              Location
              <input
                name="location"
                value={profile.location}
                onChange={handleChange}
                maxLength={120}
                autoComplete="address-level2"
                placeholder="City, country"
              />
            </label>
          </div>
        </section>

        <section className="profile-section">
          <h2>Professional details</h2>
          <div className="profile-fields">
            <label className="profile-field-wide">
              Professional headline
              <input
                name="headline"
                value={profile.headline}
                onChange={handleChange}
                maxLength={180}
                placeholder="e.g. Full-stack developer focused on Java and React"
              />
            </label>
            <label className="profile-field-wide">
              Skills
              <textarea
                name="skills"
                value={profile.skills}
                onChange={handleChange}
                maxLength={1000}
                rows={3}
                placeholder="Java, Spring Boot, React, SQL"
              />
            </label>
            <label className="profile-field-wide">
              Experience
              <textarea
                name="experience"
                value={profile.experience}
                onChange={handleChange}
                maxLength={3000}
                rows={5}
                placeholder="Describe your roles, responsibilities, and achievements."
              />
            </label>
            <label className="profile-field-wide">
              Education
              <textarea
                name="education"
                value={profile.education}
                onChange={handleChange}
                maxLength={3000}
                rows={4}
                placeholder="Add your qualification, institution, and graduation year."
              />
            </label>
          </div>
        </section>

        {error && <p className="profile-error" role="alert">{error}</p>}
        {success && <p className="profile-success" role="status">{success}</p>}
        <div className="profile-actions">
          <button type="submit" className="profile-submit" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default Profile;
