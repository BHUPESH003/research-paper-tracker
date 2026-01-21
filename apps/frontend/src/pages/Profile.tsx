import { useState, useEffect } from "react";
import { useApiKey } from "../hooks/useApiKey";

/**
 * Profile Page
 * 
 * Displays user's API key information.
 * Allows downloading/copying the key.
 */

export function Profile() {
  const { apiKey } = useApiKey();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Note: We would normally fetch user profile from backend
  // For now, email is only stored in backend during registration
  // In a production app, you'd add GET /profile endpoint
  useEffect(() => {
    // Simulate loading
    setLoading(false);
  }, []);

  const handleCopy = async () => {
    if (!apiKey) return;

    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    if (!apiKey) return;

    const blob = new Blob([`API Key: ${apiKey}\n\nIMPORTANT: Keep this key secure and do not share it publicly.`], {
      type: "text/plain"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "research-paper-tracker-api-key.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}${"*".repeat(apiKey.length - 16)}${apiKey.slice(-8)}` : "";

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Profile</h1>

      {/* User Info Section */}
      <div style={{
        marginTop: "2rem",
        padding: "1.5rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "white"
      }}>
        <h2 style={{ marginTop: 0, fontSize: "1.5rem" }}>Account Information</h2>
        <div style={{ color: "#666", fontSize: "0.875rem" }}>
          <p><strong>Status:</strong> Active</p>
          <p style={{ marginTop: "0.5rem" }}>
            <strong>Note:</strong> Your email is securely stored in the backend and linked to your API key.
          </p>
        </div>
      </div>

      {/* API Key Section */}
      <div style={{
        marginTop: "2rem",
        padding: "1.5rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "white"
      }}>
        <h2 style={{ marginTop: 0, fontSize: "1.5rem" }}>API Key</h2>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>
          Your API key is used to authenticate with the Research Paper Tracker backend.
          Keep it secure and do not share it publicly.
        </p>

        {/* API Key Display */}
        <div style={{
          padding: "1rem",
          backgroundColor: "#f9f9f9",
          border: "1px solid #ddd",
          borderRadius: "4px",
          marginBottom: "1rem",
          fontFamily: "monospace",
          fontSize: "0.875rem",
          wordBreak: "break-all"
        }}>
          {showKey ? apiKey : maskedKey}
        </div>

        {/* Actions */}
        <div style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap"
        }}>
          <button
            onClick={() => setShowKey(!showKey)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: showKey ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.875rem"
            }}
          >
            {showKey ? "Hide Key" : "Show Key"}
          </button>

          <button
            onClick={handleCopy}
            disabled={copied}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: copied ? "#28a745" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: copied ? "default" : "pointer",
              fontSize: "0.875rem"
            }}
          >
            {copied ? "✓ Copied!" : "Copy Key"}
          </button>

          <button
            onClick={handleDownload}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.875rem"
            }}
          >
            Download Key
          </button>
        </div>
      </div>

      {/* Security Warning */}
      <div style={{
        marginTop: "1.5rem",
        padding: "1rem",
        backgroundColor: "#fff3cd",
        border: "1px solid #ffc107",
        borderRadius: "4px"
      }}>
        <strong style={{ color: "#856404" }}>⚠️ Security Warning</strong>
        <p style={{ margin: "0.5rem 0 0 0", color: "#856404", fontSize: "0.875rem" }}>
          Your API key is stored locally in your browser. If you clear your browser data or switch devices,
          you will need to use this same key again to access your papers.
        </p>
      </div>

      {/* Usage Information */}
      <div style={{
        marginTop: "1.5rem",
        padding: "1.5rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "white"
      }}>
        <h3 style={{ marginTop: 0 }}>How to Use Your API Key</h3>
        <p style={{ color: "#666", fontSize: "0.875rem" }}>
          The Research Paper Tracker automatically uses your API key for all requests.
          You don't need to manually enter it anywhere in the application.
        </p>
        <p style={{ color: "#666", fontSize: "0.875rem", marginTop: "1rem" }}>
          If you need to access the API directly (e.g., via curl or Postman), include your key
          in the <code style={{
            padding: "0.2rem 0.4rem",
            backgroundColor: "#f4f4f4",
            borderRadius: "3px",
            fontFamily: "monospace"
          }}>X-API-KEY</code> header:
        </p>
        <pre style={{
          padding: "1rem",
          backgroundColor: "#f4f4f4",
          borderRadius: "4px",
          overflow: "auto",
          fontSize: "0.875rem",
          marginTop: "0.5rem"
        }}>
{`curl -H "X-API-KEY: your-api-key-here" \\
  http://localhost:4000/papers`}
        </pre>
      </div>
    </div>
  );
}
