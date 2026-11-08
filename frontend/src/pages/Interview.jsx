import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Interview.css";

const QUESTIONS_PER_SET = 50;
const QUESTIONS_PER_BATCH = 5;

const INTERVIEW_YEARS = Array.from(
  { length: 3 },
  (_, index) => new Date().getFullYear() - index - 1
);

function Interview() {

  const location = useLocation();

  const [job, setJob] = useState(() => {
    if (location.state?.job) return location.state.job;
    try {
      const savedJob = sessionStorage.getItem("selectedJob");
      return savedJob ? JSON.parse(savedJob) : null;
    } catch (error) {
      console.error("Could not restore selected interview job:", error);
      return null;
    }
  });
  const [jobOptions, setJobOptions] = useState([]);
  const [jobSearch, setJobSearch] = useState("");
  const [jobOptionsLoading, setJobOptionsLoading] = useState(true);
  const [jobOptionsError, setJobOptionsError] = useState("");

  const [questionSets, setQuestionSets] = useState({});
  const [questionSources, setQuestionSources] = useState({});
  const [selectedYear, setSelectedYear] = useState(INTERVIEW_YEARS[0]);
  const questions = questionSets[selectedYear] || [];
  const sources = questionSources[selectedYear] || [];

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState(null);

  const [score, setScore] =
    useState(0);

  const [finished, setFinished] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/jobs?keyword=software%20developer&location=India")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Could not load jobs.");
        }
        return Array.isArray(data) ? data : data.results || [];
      })
      .then((jobs) => {
        if (active) setJobOptions(jobs);
      })
      .catch((requestError) => {
        if (active) {
          setJobOptionsError(requestError.message || "Could not connect to the jobs service.");
        }
      })
      .finally(() => {
        if (active) setJobOptionsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const searchJobsForInterview = async (event) => {
    event.preventDefault();
    setJobOptionsLoading(true);
    setJobOptionsError("");

    try {
      const query = jobSearch.trim() || "software developer";
      const response = await fetch(
        `/api/jobs?keyword=${encodeURIComponent(query)}&location=India`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not load jobs.");
      }
      setJobOptions(Array.isArray(data) ? data : data.results || []);
    } catch (requestError) {
      setJobOptionsError(requestError.message || "Could not connect to the jobs service.");
    } finally {
      setJobOptionsLoading(false);
    }
  };

  const selectJob = (selectedJob) => {
    setJob(selectedJob);
    sessionStorage.setItem("selectedJob", JSON.stringify(selectedJob));
    setQuestionSets({});
    setQuestionSources({});
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
    setError("");
  };

  const selectYear = (year) => {
    setSelectedYear(year);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
    setError("");
  };

  const generateQuestions = async () => {

    if (!job) {

      setError(
        "Job information is not available."
      );

      return;
    }

    setLoading(true);
    setError("");

    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
    setQuestionSets((previous) => ({
      ...previous,
      [selectedYear]: [],
    }));
    setQuestionSources((previous) => ({
      ...previous,
      [selectedYear]: [],
    }));

    try {

      const jobTitle =
        job.title ||
        "Software Developer";

      const company = job.company?.display_name || "Company not specified";
      const skills = [
        job.category?.label,
        job.description?.replace(/<[^>]*>/g, " "),
      ]
        .filter(Boolean)
        .join("\n")
        .slice(0, 1400) || "Relevant role skills and problem solving";
      const requestBody = JSON.stringify({
        company,
        jobTitle,
        skills,
        year: selectedYear,
      });

      let response = await fetch("/api/interview/questions/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });

      if (response.status === 404) {
        response = await fetch("/api/interview/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        });
        const data = await response.json();

        if (!response.ok || data.success === false) {
          throw new Error(data.message || "Failed to generate questions.");
        }

        const validQuestions =
          Array.isArray(data.questions) &&
          data.questions.length === QUESTIONS_PER_SET &&
          data.questions.every(
            (item) =>
              item.question &&
              Array.isArray(item.options) &&
              item.options.length === 4 &&
              typeof item.correctAnswer === "number" &&
              item.year === selectedYear
          );

        if (!validQuestions) {
          throw new Error("The generated questions were incomplete or invalid. Please retry.");
        }

        setQuestionSets((previous) => ({
          ...previous,
          [selectedYear]: data.questions,
        }));
        setQuestionSources((previous) => ({
          ...previous,
          [selectedYear]: Array.isArray(data.sources) ? data.sources : [],
        }));
      } else {
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to generate questions.");
        }

        if (!response.body) {
          throw new Error("The browser cannot read the question stream. Please retry.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let streamedCount = 0;
        let completed = false;

        const handleEvent = (frame) => {
          let eventName = "message";
          const dataLines = [];
          frame.split("\n").forEach((line) => {
            if (line.startsWith("event:")) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLines.push(line.slice(5).trim());
            }
          });

          if (dataLines.length === 0) return;
          const payload = JSON.parse(dataLines.join("\n"));

          if (eventName === "error") {
            throw new Error(payload.message || "Failed to generate questions.");
          }

          if (eventName === "sources") {
            const retrievedSources = payload.sources;
            if (
              !Array.isArray(retrievedSources) ||
              retrievedSources.some(
                (source) =>
                  typeof source.title !== "string" ||
                  typeof source.url !== "string"
              )
            ) {
              throw new Error("The web search returned invalid source references.");
            }
            setQuestionSources((previous) => ({
              ...previous,
              [selectedYear]: retrievedSources,
            }));
          }

          if (eventName === "batch") {
            const batch = payload.questions;
            const validBatch =
              Array.isArray(batch) &&
              batch.length === QUESTIONS_PER_BATCH &&
              batch.every(
                (item) =>
                  item.question &&
                  Array.isArray(item.options) &&
                  item.options.length === 4 &&
                  typeof item.correctAnswer === "number" &&
                  item.year === selectedYear
              );

            if (!validBatch || streamedCount + batch.length > QUESTIONS_PER_SET) {
              throw new Error("Ollama returned an invalid question batch. Please retry.");
            }

            streamedCount += batch.length;
            setQuestionSets((previous) => ({
              ...previous,
              [selectedYear]: [
                ...(previous[selectedYear] || []),
                ...batch,
              ],
            }));
          } else if (eventName === "complete") {
            if (
              payload.totalQuestions !== QUESTIONS_PER_SET ||
              streamedCount !== QUESTIONS_PER_SET
            ) {
              throw new Error(
                `Ollama did not return exactly ${QUESTIONS_PER_SET} questions. Please retry.`
              );
            }
            completed = true;
          }
        };

        while (true) {
          const { value, done } = await reader.read();
          buffer = (buffer + decoder.decode(value, { stream: !done })).replace(/\r\n/g, "\n");

          let separator = buffer.indexOf("\n\n");
          while (separator !== -1) {
            handleEvent(buffer.slice(0, separator));
            buffer = buffer.slice(separator + 2);
            separator = buffer.indexOf("\n\n");
          }

          if (done) {
            if (buffer.trim()) handleEvent(buffer);
            break;
          }
        }

        if (!completed) {
          throw new Error("The question stream ended before generation completed. Please retry.");
        }
      }

    } catch (err) {

      console.error(
        "Interview API Error:",
        err
      );

      setError(
        err.message ||
        "Unable to generate interview questions."
      );

    } finally {

      setLoading(false);
    }
  };

  /*
   * Select answer
   */
  const handleAnswer =
    (optionIndex) => {

      if (selectedAnswer !== null) {
        return;
      }

      setSelectedAnswer(optionIndex);

      const question = questions[currentQuestion];

      const isCorrect =
        optionIndex ===
        Number(question.correctAnswer);

      if (isCorrect) {

        setScore(
          (previous) =>
            previous + 1
        );
      }
    };

  /*
   * Next question
   */
  const nextQuestion = () => {

    if (
      currentQuestion <
      questions.length - 1
    ) {

      setCurrentQuestion(
        (previous) =>
          previous + 1
      );

      setSelectedAnswer(null);

    } else {

      setFinished(true);
    }
  };

  /*
   * Restart interview
   */
  const restartInterview = () => {

    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
  };

  /*
   * No job selected
   */
  if (!job) {

    return (
      <main className="interview-page">
        <section className="interview-header">
          <div className="interview-container">
            <span className="interview-label">AI INTERVIEW</span>
            <h1>Choose a job to practice for</h1>
            <p>We’ll use the role and its skills to prepare your interview questions.</p>
          </div>
        </section>
        <main className="interview-container interview-picker">
          <form className="interview-picker-search" onSubmit={searchJobsForInterview}>
            <label htmlFor="interviewJobSearch">Job title or skills</label>
            <div>
              <input
                id="interviewJobSearch"
                value={jobSearch}
                onChange={(event) => setJobSearch(event.target.value)}
                placeholder="e.g. Java developer"
              />
              <button type="submit" disabled={jobOptionsLoading}>
                {jobOptionsLoading ? "Searching..." : "Search jobs"}
              </button>
            </div>
          </form>
          {jobOptionsError && (
            <div className="interview-error" role="alert">
              {jobOptionsError}
              <button type="button" onClick={searchJobsForInterview}>Retry</button>
            </div>
          )}
          {jobOptionsLoading && <p className="loading-box">Loading current job listings...</p>}
          {!jobOptionsLoading && !jobOptionsError && jobOptions.length === 0 && (
            <p className="loading-box">No job listings found. Try another search.</p>
          )}
          <div className="interview-job-options">
            {jobOptions.map((option, index) => (
              <article className="interview-option-card" key={option.id || index}>
                <div className="company-logo">
                  {(option.company?.display_name || "C").charAt(0).toUpperCase()}
                </div>
                <div className="interview-option-info">
                  <h2>{option.title || "Job opportunity"}</h2>
                  <p>{option.company?.display_name || "Company"} · {option.location?.display_name || "Location not specified"}</p>
                  <span>{option.category?.label || "Skills based on job description"}</span>
                </div>
                <button type="button" onClick={() => selectJob(option)}>Practice</button>
              </article>
            ))}
          </div>
          <Link to="/jobs" className="back-to-jobs">← Browse all jobs</Link>
        </main>
      </main>
    );
  }

  /*
   * Final score
   */
  if (finished) {

    const percentage =
      Math.round(
        (score / questions.length) *
        100
      );

    let resultMessage =
      "Keep practicing!";

    if (percentage >= 80) {
      resultMessage =
        "Excellent performance!";
    } else if (percentage >= 60) {
      resultMessage =
        "Good performance!";
    } else if (percentage >= 40) {
      resultMessage =
        "You can improve with more practice.";
    }

    return (
      <div className="interview-page">

        <section className="interview-header">

          <div className="interview-container">

            <span className="interview-label">
              AI INTERVIEW RESULT
            </span>

            <h1>
              Interview Completed
            </h1>

          </div>

        </section>

        <main className="interview-container">

          <div className="result-card">

            <h2>
              Your Score
            </h2>

            <div className="score-number">
              {score} / {questions.length}
            </div>

            <div className="percentage">
              {percentage}%
            </div>

            <h3>
              {resultMessage}
            </h3>

            <p>
              Job:{" "}
              {job.title}
            </p>
            <p>
              Company: {job.company?.display_name || "Company not specified"} · Practice set: {selectedYear}
            </p>

            <div className="result-actions">

              <button
                onClick={restartInterview}
                className="generate-button"
              >
                Try Again
              </button>

              <Link
                to="/jobs"
                className="back-to-jobs"
              >
                Back to Jobs
              </Link>

            </div>

          </div>

        </main>

      </div>
    );
  }

  const question =
    questions[currentQuestion];

  return (
    <div className="interview-page">

      {/* Header */}

      <section className="interview-header">

        <div className="interview-container">

          <Link
            to="/jobs"
            className="back-link"
          >
            ← Back to Jobs
          </Link>

          <span className="interview-label">
            AI INTERVIEW
          </span>

          <h1>
            Prepare for your interview
          </h1>

          <p>
            Practice MCQ questions
            generated specifically
            for this job.
          </p>

        </div>

      </section>

      <main className="interview-container">

        {/* Job */}

        <section className="interview-job-card">

          <div className="company-logo">

            {(job.company?.display_name ||
              "C")
              .charAt(0)
              .toUpperCase()}

          </div>

          <div>

            <h2>
              {job.title ||
                "Job Opportunity"}
            </h2>

            <p>
              {job.company?.display_name ||
                "Company"}
            </p>

            <span>
              📍{" "}
              {job.location?.display_name ||
                "Location not specified"}
            </span>

          </div>

        </section>

        <section className="interview-year-picker" aria-label="Choose interview practice year">
          <h2>Practice by year</h2>
          <p>Select one of the three most recent completed years.</p>
          <div className="interview-year-options">
            {INTERVIEW_YEARS.map((year) => (
              <button
                key={year}
                type="button"
                className={year === selectedYear ? "selected" : ""}
                aria-pressed={year === selectedYear}
                onClick={() => selectYear(year)}
                disabled={loading}
              >
                <span>{year}</span>
                <small>
                  {questionSets[year]
                    ? `${questionSets[year].length} questions ready`
                    : `Generate ${QUESTIONS_PER_SET} questions`}
                </small>
              </button>
            ))}
          </div>
          <p className="interview-history-note">
            Ollama uses public interview reports from the selected year to create original practice
            questions. They are not verified verbatim questions from actual interviews.
          </p>
        </section>

        {loading && (
          <p className="loading-box" role="status">
            Searching past interview reports and asking Ollama to prepare your{" "}
            {QUESTIONS_PER_SET}-question set for{" "}
            {job.company?.display_name || "this company"}, the{" "}
            {job.title || "selected role"}, and {selectedYear}.{" "}
            {questions.length} of {QUESTIONS_PER_SET} ready. They will appear as soon as generation completes.
          </p>
        )}

        {questions.length < QUESTIONS_PER_SET && !loading && (

          <section className="generate-section">

            <h2>
              {selectedYear} practice questions
            </h2>

            <p>
              {questions.length > 0
                ? `${questions.length} questions were generated before the request stopped. Retry to generate a fresh complete set.`
                : `Generate ${QUESTIONS_PER_SET} multiple-choice questions tailored to ${job.title || "this role"} at ${job.company?.display_name || "the selected company"}.`}
            </p>

            <button
              className="generate-button"
              onClick={
                generateQuestions
              }
            >
              {questions.length > 0
                ? `Regenerate ${QUESTIONS_PER_SET} Questions`
                : `Generate ${QUESTIONS_PER_SET} Questions for ${selectedYear}`}
            </button>

          </section>

        )}

        {/* Error */}

        {error && (

          <div className="interview-error">
            {error}
          </div>

        )}

        {sources.length > 0 && (
          <section className="interview-sources" aria-label="Research sources">
            <h2>Sources researched for {selectedYear}</h2>
            <p>These public pages informed the original practice questions.</p>
            <ul>
              {sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.title}
                  </a>
                  {source.publishedDate && <span> · {source.publishedDate}</span>}
                  {source.content && <p>{source.content}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* MCQ */}

        {questions.length > 0 &&
          question && (

            <section className="questions-section">

              <div className="question-progress">

                Question{" "}
                {currentQuestion + 1}
                {" "}of{" "}
                {questions.length} · {selectedYear} practice

              </div>

              <div className="question-card">

                <div className="question-top">

                  <span>{question.year} practice</span>

                  <span>
                    {question.category ||
                      "Technical"}
                  </span>

                  <span>
                    {question.difficulty ||
                      "Medium"}
                  </span>

                </div>

                <h2>
                  {question.question}
                </h2>

                <div className="options">

                  {question.options.map(
                    (option, index) => {

                      const isSelected =
                        selectedAnswer ===
                        index;

                      const isCorrect =
                        index ===
                        Number(
                          question.correctAnswer
                        );

                      let optionClass =
                        "option-button";

                      if (
                        selectedAnswer !==
                        null
                      ) {

                        if (isCorrect) {

                          optionClass +=
                            " correct";

                        } else if (
                          isSelected
                        ) {

                          optionClass +=
                            " wrong";
                        }
                      }

                      return (

                        <button
                          key={index}
                          className={
                            optionClass
                          }
                          onClick={() =>
                            handleAnswer(
                              index
                            )
                          }
                          disabled={
                            selectedAnswer !==
                            null
                          }
                        >

                          <span className="option-letter">
                            {String.fromCharCode(
                              65 + index
                            )}
                          </span>

                          <span>
                            {option}
                          </span>

                        </button>

                      );
                    }
                  )}

                </div>

                {/* Answer result */}

                {selectedAnswer !==
                  null && (

                  <div
                    className={
                      selectedAnswer ===
                      Number(
                        question.correctAnswer
                      )
                        ? "answer-feedback correct-feedback"
                        : "answer-feedback wrong-feedback"
                    }
                  >

                    {selectedAnswer ===
                    Number(
                      question.correctAnswer
                    )
                      ? "✓ Correct answer!"
                      : "✗ Wrong answer"}

                  </div>

                )}

                {/* Next */}

                {selectedAnswer !==
                  null && (

                  <button
                    className="next-button"
                    onClick={
                      nextQuestion
                    }
                    disabled={
                      currentQuestion === questions.length - 1 &&
                      (loading || questions.length < QUESTIONS_PER_SET)
                    }
                  >

                    {currentQuestion <
                    questions.length - 1
                      ? "Next Question →"
                      : loading
                        ? "Waiting for more questions..."
                        : questions.length < QUESTIONS_PER_SET
                          ? "Retry generation to continue"
                          : `Finish ${selectedYear} Set`}

                  </button>

                )}

              </div>

            </section>

          )}

      </main>

    </div>
  );
}

export default Interview;