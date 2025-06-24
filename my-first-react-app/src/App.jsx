import React, { useState } from "react";
import { MdCloudUpload, MdInsertDriveFile, MdArrowDropDown } from "react-icons/md";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { ChatOutput } from "./scripts/Root.jsx";


function App() {
  const [screen, setScreen] = useState("splash");
  const [files, setFiles] = useState({ lesson: null, overview: null });
  const [response, setResponse] = useState("");
  const [fade, setFade] = useState(true);

  async function fetchRubricBlob() {
    const res = await fetch("/assets/rubric.docx");
    if (!res.ok) throw new Error("Failed to load rubric file");
    return await res.blob();
  }

  const handleFileSelect = (fileKey, file) => {
    setFiles((prev) => {
      const updatedFiles = { ...prev, [fileKey]: file };

      if (updatedFiles.lesson && updatedFiles.overview) {
        startProcessing(updatedFiles);
      } else {
        if (fileKey === "overview") {
          setFade(false);
          setTimeout(() => {
            setScreen("upload3");
            setFade(true);
          }, 300); // must match CSS transition time
        }
      }

      return updatedFiles;
    });
  };

  const startProcessing = async (finalFiles) => {
    setScreen("loading");
    setResponse("");

    try {
      const formData = new FormData();
      formData.append("file2", finalFiles.lesson);
      formData.append("file3", finalFiles.overview);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || "Upload failed");

      setResponse(text);
      setScreen("results");
    } catch (err) {
      setResponse(`❗ Error: ${err.message}`);
      setScreen("results");
    }
  };

  const SplashScreen = ({ onStart }) => {
    const container = {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      padding: "1rem",
    };

    const content = {
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      maxWidth: "600px",
      width: "100%",
    };

    const titleBox = {
      background: "linear-gradient(to right, #00aaff, #0056b3)",
      borderRadius: "20px",
      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
      padding: "2rem",
      textAlign: "center",
    };

    const title = {
      color: "white",
      fontSize: "2.5rem",
      margin: 0,
      textDecoration: "none",
    };

    const descriptionBox = {
      background: "#fff",
      border: "2px solid #00aaff",
      borderRadius: "20px",
      padding: "1.5rem",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      color: "#222",
      fontSize: "1.1rem",
      lineHeight: "1.6",
    };

    const buttonBox = {
      textAlign: "center",
    };

    const button = {
      backgroundColor: "#00aaff",
      color: "white",
      fontSize: "1rem",
      padding: "0.75rem 2rem",
      border: "none",
      borderRadius: "999px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      cursor: "pointer",
      transition: "all 0.3s ease",
    };

    const buttonHover = (e) => {
      e.target.style.backgroundColor = "#0056b3";
      e.target.style.transform = "translateY(-2px)";
    };

    const buttonLeave = (e) => {
      e.target.style.backgroundColor = "#00aaff";
      e.target.style.transform = "translateY(0)";
    };

    return (
      <div style={container}>
        <div style={content}>
          <div style={titleBox}>
            <h1 style={title}>EduQA Insight</h1>
          </div>

          <div style={descriptionBox}>
            <p>
              Upload a course syllabus and lecture file to automatically evaluate
              their clarity, engagement, learning alignment, and tech usage.
              <br />
              <br />
              Our AI-powered tool provides instant, actionable feedback to improve
              academic quality based on course development <a href="assets/rubric.docx" download="Rubric.docx">rubric</a>.
            </p>
          </div>

          <div style={buttonBox}>
            <button
              style={button}
              onClick={() => setScreen("upload2")}
              onMouseEnter={buttonHover}
              onMouseLeave={buttonLeave}
            >
              Start Review
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="outer-container">
      <div className="scale-wrapper">
        {screen === "splash" && <SplashScreen onStart={() => setScreen("upload2")} />}

        {(screen === "upload2" || screen === "upload3") && (
          <div className={`fade-wrapper ${fade ? "fade-in" : "fade-out"}`}>
            <UploadScreen
              step={screen}
              onFileUpload={(file) =>
                handleFileSelect(screen === "upload2" ? "overview" : "lesson", file)
              }
            />
          </div>
        )}

        {screen === "loading" && <LoadingScreen />}
        {screen === "results" && <ResultsScreen response={response} />}
      </div>
    </div>
  );
}


function UploadScreen({ step, onFileUpload }) {
  const [dragActive, setDragActive] = useState(false);

  const fileLabels = {
    upload2: "Upload Course Syllabus",
    upload3: "Upload Lecture Slides",
  };

  const stepNumbers = {
    upload2: 1,
    upload3: 2,
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  return (
    <div style={{ padding: '100px', display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          borderRadius: '16px',
          backgroundColor: '#f9f9fc',
          padding: '2rem',
          width: '100%',
          maxWidth: '720px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#0056b3',
            textDecoration: 'none',
            fontSize: '1.25rem'
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#0056b3',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            {stepNumbers[step]}
          </span>
          <span style={{ color: '#0056b3', marginBottom: '0.1rem', fontSize: '25px' }}>|</span>
          {fileLabels[step]}
        </h1>
        <div
          className={`upload-box ${dragActive ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-content">
            <MdCloudUpload size={64} color="#0077cc" style={{ marginBottom: '1rem' }} />
            <label className="button-label">
              <div className="choose-file-button">
                <MdInsertDriveFile size={20} style={{ marginRight: '0.5rem' }} />
                Choose File
                <MdArrowDropDown size={20} style={{ marginLeft: '0.5rem' }} />
              </div>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    onFileUpload(e.target.files[0]);
                  }
                }}
              />
            </label>
            <p className="upload-instruction" style={{ marginTop: '1rem' }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0077cc"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}
              >
                <path d="M12 5v10h8" />
                <polyline points="16 13 20 15 16 17" />
              </svg>
              or drag and drop
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
function LoadingScreen() {
  return (
    <div className="centered-container">
      <div className="modern-loader"></div>
      <p className="loading-message">Analyzing your files...</p>
    </div>
  );
}
function ResultsScreen({ response }) {
  console.log(response);

  const relevanceMatch = response.match(/1\. Relevance Summary\s+([\s\S]*?)\s+2\. Rubric Evaluation/i);
  const rubricMatch = response.match(/2\. Rubric Evaluation\s+([\s\S]*?)\s+3\. Suggestions for Improvement/i);
  const suggestionsMatch = response.match(/3\. Suggestions for Improvement\s+([\s\S]*)/i);

  const relevanceSummary = relevanceMatch ? relevanceMatch[1].trim() : "";
  const rubricText = rubricMatch ? rubricMatch[1].trim() : "";
  const suggestionsText = suggestionsMatch ? suggestionsMatch[1].trim() : "";

  const rubricBlocks = rubricText
    ? rubricText.split(/\n\s*\n/).map((block) => {
        const criterionMatch = block.match(/Criterion:\s*(.+)/i);
        const scoreMatch = block.match(/Score:\s*(\d+)/i);
        const explanationMatch = block.match(/Explanation:\s*([\s\S]+)/i);

        return {
          criterion: criterionMatch ? criterionMatch[1].trim() : "Unknown",
          score: scoreMatch ? parseInt(scoreMatch[1], 10) : null,
          explanation: explanationMatch ? explanationMatch[1].trim() : "",
        };
      })
    : [];

  const suggestions = suggestionsText
    ? suggestionsText
        .split(/\n(?=[A-Z])/)
        .map((block) => block.trim())
        .filter((block) => block.length > 0)
        .map((block) => {
          const colonSplit = block.split(":");
          return {
            criterion: colonSplit[0].trim(),
            suggestions: colonSplit.slice(1).join(":").trim(),
          };
        })
    : [];

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        overflowY: "auto",
        padding: "2rem 1rem 350px",
        display: "flex",
        justifyContent: "center",
        boxSizing: "border-box",
        backgroundColor: "#fefefe",
      }}
    >
      <div
        style={{
          padding: "2rem",
          border: "1px solid #ccc",
          borderRadius: "10px",
          backgroundColor: "#ffffff",
          fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
          lineHeight: "1.6",
          fontSize: "1rem",
          maxWidth: "900px",
          width: "100%",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h2 style={headingStyle}>Relevance Summary</h2>
        <p style={paragraphStyle}>{relevanceSummary}</p>

        <h2 style={headingStyle}>Rubric Evaluation</h2>
        <div style={{ overflowX: "auto", marginBottom: "2rem" }}>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              tableLayout: "fixed",
              wordWrap: "break-word",
              fontSize: "1rem",
              backgroundColor: "#fcfcfc",
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Criteria</th>
                <th style={thStyle}>Score</th>
                <th style={thStyle}>Explanation</th>
              </tr>
            </thead>
            <tbody>
              {rubricBlocks.map(({ criterion, score, explanation }, i) => (
                <tr key={i}>
                  <td style={centeredTdStyle}>{criterion}</td>
                  <td style={{ ...centeredTdStyle, fontWeight: "bold" }}>{score}</td>
                  <td style={centeredTdStyle}>{explanation}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ ...centeredTdStyle, fontWeight: "bold", backgroundColor: "#eaeaea" }}>
                  Total
                </td>
                <td colSpan={2} style={tfootScoreStyle}>
                  {(() => {
                    const totalScore = rubricBlocks.reduce(
                      (sum, item) => sum + (item.score || 0),
                      0
                    );
                    const percentage = Math.round((totalScore / 32) * 100);
                    return `${percentage}%`
                  })()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <h2 style={headingStyle}>Suggestions for Improvement</h2>
        {suggestions.length === 0 ? (
          <p style={paragraphStyle}>No improvement suggestions provided.</p>
        ) : (
          <ul style={{ paddingLeft: "1.5rem", paddingBottom: "2rem" }}>
            {suggestions.map(({ criterion, suggestions }, i) => (
              <li key={i} style={{ marginBottom: "1rem" }}>
                <strong style={{ color: "#0077cc" }}>{criterion}:</strong> {suggestions}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// 🌈 Refined Styles
const headingStyle = {
  fontSize: "1.4rem",
  fontWeight: "600",
  color: "#0077cc",
  marginBottom: "1rem",
  borderBottom: "2px solid #e0f0ff",
  paddingBottom: "0.25rem",
};

const paragraphStyle = {
  marginBottom: "2rem",
  color: "#333",
};

const thStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  backgroundColor: "#e6f4ff",
  textAlign: "center",
  color: "#005999",
  fontSize: "1rem",
};

const centeredTdStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "center",
  verticalAlign: "middle",
  wordWrap: "break-word",
};

const tfootScoreStyle = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "center",
  fontWeight: "bold",
  backgroundColor: "#f2fbff",
  fontSize: "1.2rem",
};



export default App;
