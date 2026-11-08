import { useState } from "react";
import { Link } from "react-router-dom";
import "./ResumeAnalyzer.css";

const SKILL_GROUPS = [
  { name: "Programming", skills: ["Java", "Python", "JavaScript", "TypeScript", "C++"] },
  { name: "Frontend", skills: ["React", "HTML", "CSS", "Angular"] },
  { name: "Backend", skills: ["Spring Boot", "Node.js", "REST API", "Express"] },
  { name: "Data", skills: ["MongoDB", "SQL", "PostgreSQL", "MySQL"] },
  { name: "Tools & Cloud", skills: ["Git", "Docker", "AWS", "Azure", "Kubernetes"] },
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  const analyzeResume = () => {
    setError("");
    const text = resumeText.trim();
    if (text.length < 40) {
      setAnalysis(null);
      setError("Paste more resume text (at least 40 characters) to get useful feedback.");
      return;
    }

    const skills = SKILL_GROUPS.flatMap((group) => {
      const found = group.skills.filter((skill) => {
        const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(skill)}($|[^a-z0-9])`, "i");
        return pattern.test(text);
      });
      return found.map((skill) => ({ skill, group: group.name }));
    });

    const sectionSignals = [
      ["Experience", /\b(experience|employment|work history|professional summary)\b/i],
      ["Education", /\b(education|degree|university|college|bachelor|master)\b/i],
      ["Projects", /\b(projects|project experience|portfolio)\b/i],
    ];
    const sections = sectionSignals.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
    const suggestions = [];

    if (skills.length < 3) suggestions.push("Add a dedicated skills section with the technologies relevant to your target role.");
    if (!sections.includes("Experience")) suggestions.push("Add experience, internships, or practical work examples.");
    if (!sections.includes("Projects")) suggestions.push("Include projects that demonstrate how you applied your skills.");
    if (!sections.includes("Education")) suggestions.push("Add your education or relevant training.");
    if (text.split(/\s+/).length < 100) suggestions.push("Add more detail about your responsibilities and measurable results.");

    setAnalysis({
      skills,
      sections,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      suggestions: suggestions.length ? suggestions : ["Your resume includes several useful sections. Tailor the summary and achievements to each job."],
    });
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name)) {
      setError("For privacy, this first version accepts text files only. Copy text from your PDF resume and paste it below.");
      event.target.value = "";
      return;
    }

    try {
      setResumeText(await file.text());
      setAnalysis(null);
      setError("");
    } catch (fileError) {
      console.error("Resume file read error:", fileError);
      setError("Could not read that file. Paste your resume text instead.");
    }
  };

  return (
    <main className="resume-page">
      <header className="resume-heading">
        <span className="resume-eyebrow">CAREER TOOL</span>
        <h1>Resume Analyzer</h1>
        <p>Review the skills and sections in your resume, then find jobs to explore.</p>
        <p className="resume-privacy">Your resume is analyzed locally in this browser and is not uploaded or saved.</p>
      </header>

      <section className="resume-workspace">
        <label className="resume-upload">
          <span>Upload a text resume (.txt or .md)</span>
          <input type="file" accept=".txt,.md,text/plain,text/markdown" onChange={handleFile} />
        </label>
        <label className="resume-text-label" htmlFor="resumeText">Or paste your resume text</label>
        <textarea
          id="resumeText"
          rows="14"
          value={resumeText}
          onChange={(event) => {
            setResumeText(event.target.value);
            setAnalysis(null);
          }}
          placeholder="Paste your resume content here..."
        />
        {error && <p className="resume-error" role="alert">{error}</p>}
        <button type="button" className="resume-analyze-button" onClick={analyzeResume}>
          Analyze resume
        </button>
      </section>

      {analysis && (
        <section className="resume-results" aria-live="polite">
          <div className="resume-summary">
            <div><strong>{analysis.wordCount}</strong><span>words reviewed</span></div>
            <div><strong>{analysis.skills.length}</strong><span>recognized skills</span></div>
            <div><strong>{analysis.sections.length}/3</strong><span>key sections found</span></div>
          </div>
          <div className="resume-result-grid">
            <article className="resume-result-card">
              <h2>Skills found</h2>
              {analysis.skills.length ? (
                <div className="resume-skills">
                  {analysis.skills.map(({ skill, group }) => <span key={skill} title={group}>{skill}</span>)}
                </div>
              ) : <p>No skills from the built-in list were detected. Add specific tools and technologies to your resume.</p>}
            </article>
            <article className="resume-result-card">
              <h2>Suggestions</h2>
              <ul>{analysis.suggestions.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}</ul>
            </article>
          </div>
          <Link
            className="resume-jobs-link"
            to={`/jobs?keyword=${encodeURIComponent(analysis.skills.slice(0, 3).map(({ skill }) => skill).join(" ") || "software developer")}`}
          >
            Find jobs using these skills
          </Link>
        </section>
      )}
    </main>
  );
}

export default ResumeAnalyzer;