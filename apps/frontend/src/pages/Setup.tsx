import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { post, setApiKey, ApiError } from "../services/api";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

/**
 * Setup Page
 * 
 * Collects user's email and generates an API key for them.
 * Displays the API key (one-time view) and stores it locally.
 */

interface SetupForm {
  email: string;
}

export function Setup() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"form" | "registering" | "success" | "error">("form");
  const [error, setError] = useState<string | null>(null);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showImportKey, setShowImportKey] = useState(false);
  const [importedKey, setImportedKey] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SetupForm>();

  const onSubmit = async (data: SetupForm) => {
    setStatus("registering");
    setError(null);

    try {
      // Register user and get API key
      const result = await post<{ id: string; apiKey: string }>("/setup", { 
        email: data.email 
      });

      // Store API key locally
      localStorage.setItem("RPT_API_KEY", result.apiKey);
      setApiKey(result.apiKey);
      
      // Mark setup as complete
      localStorage.setItem("RPT_SETUP_COMPLETE", "true");
      
      // Show success with API key
      setGeneratedApiKey(result.apiKey);
      setStatus("success");
    } catch (err) {
      if (err instanceof ApiError) {
        // If email already exists, show import key option
        if (err.code === "EMAIL_EXISTS") {
          setError("This email is already registered. Please enter your API key below to continue.");
          setShowImportKey(true);
          setStatus("form");
          return;
        }
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to register user");
      }
      setStatus("error");
    }
  };

  const handleImportKey = () => {
    if (!importedKey.trim()) {
      alert("Please enter your API key");
      return;
    }

    // Store the imported key
    localStorage.setItem("RPT_API_KEY", importedKey.trim());
    setApiKey(importedKey.trim());
    localStorage.setItem("RPT_SETUP_COMPLETE", "true");

    // Redirect to library
    navigate("/library");
  };

  const handleCopy = async () => {
    if (!generatedApiKey) return;

    try {
      await navigator.clipboard.writeText(generatedApiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    if (!generatedApiKey) return;

    const blob = new Blob([
      `Research Paper Tracker - API Key\n` +
      `================================\n\n` +
      `API Key: ${generatedApiKey}\n\n` +
      `IMPORTANT SECURITY NOTICE:\n` +
      `- Keep this key secure and do not share it publicly\n` +
      `- This key will be saved in your browser automatically\n` +
      `- If you clear browser data, you'll need this key again\n` +
      `- You can view this key anytime in your Profile page\n`
    ], { type: "text/plain" });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "research-paper-tracker-api-key.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleContinue = () => {
    navigate("/library");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "80vh",
      padding: "2rem"
    }}>
      <div style={{
        maxWidth: "600px",
        width: "100%",
        padding: "2rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "white"
      }}>
        {/* Form State */}
        {status === "form" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h1 style={{ marginBottom: "0.5rem" }}>Welcome to Research Paper Tracker</h1>
              <p style={{ color: "#666", fontSize: "0.875rem" }}>
                Enter your email to get started. We'll generate a unique API key for you.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label htmlFor="email" style={{ display: "block", fontWeight: "500", marginBottom: "0.5rem" }}>
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address"
                    }
                  })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: `1px solid ${errors.email ? "#dc3545" : "#ddd"}`,
                    borderRadius: "4px",
                    fontSize: "1rem"
                  }}
                />
                {errors.email && (
                  <div style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                    {errors.email.message}
                  </div>
                )}
              </div>

              {error && (
                <div style={{
                  padding: "0.75rem",
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  border: "1px solid #f5c6cb",
                  borderRadius: "4px",
                  marginTop: "1rem"
                }}>
                  {error}
                </div>
              )}

              {showImportKey && (
                <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #ddd" }}>
                  <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Import Your API Key</h3>
                  <input
                    type="text"
                    placeholder="Paste your API key here"
                    value={importedKey}
                    onChange={(e) => setImportedKey(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      fontFamily: "monospace",
                      marginBottom: "0.75rem"
                    }}
                  />
                  <button
                    onClick={handleImportKey}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: "500"
                    }}
                  >
                    Import and Continue
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: isSubmitting ? "#6c757d" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                  marginTop: showImportKey ? "0" : "0"
                }}
              >
                {isSubmitting ? "Setting Up..." : (showImportKey ? "Register with Different Email" : "Get Started")}
              </button>
            </form>
          </>
        )}

        {/* Registering State */}
        {status === "registering" && (
          <>
            <LoadingSpinner size="large" />
            <h2 style={{ marginTop: "1rem", textAlign: "center" }}>Creating Your Account</h2>
            <p style={{ color: "#666", textAlign: "center" }}>
              Generating your API key...
            </p>
          </>
        )}

        {/* Success State - Show API Key */}
        {status === "success" && generatedApiKey && (
          <>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
              <h2>Setup Complete!</h2>
              <p style={{ color: "#666" }}>
                Your API key has been generated and saved locally.
              </p>
            </div>

            {/* API Key Display */}
            <div style={{
              padding: "1rem",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "4px",
              marginBottom: "1.5rem"
            }}>
              <strong style={{ color: "#856404" }}>⚠️ Important: Save Your API Key</strong>
              <p style={{ margin: "0.5rem 0 0 0", color: "#856404", fontSize: "0.875rem" }}>
                This is the only time your API key will be displayed in full. 
                Please copy or download it now.
              </p>
            </div>

            <div style={{
              padding: "1rem",
              backgroundColor: "#f9f9f9",
              border: "1px solid #ddd",
              borderRadius: "4px",
              marginBottom: "1rem",
              fontFamily: "monospace",
              fontSize: "0.75rem",
              wordBreak: "break-all"
            }}>
              {generatedApiKey}
            </div>

            {/* Actions */}
            <div style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              marginBottom: "1.5rem"
            }}>
              <button
                onClick={handleCopy}
                disabled={copied}
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
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
                  flex: 1,
                  padding: "0.75rem 1rem",
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

            <button
              onClick={handleContinue}
              style={{
                width: "100%",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500"
              }}
            >
              Continue to Library →
            </button>

            <p style={{ color: "#666", fontSize: "0.875rem", marginTop: "1rem", textAlign: "center" }}>
              You can view your API key anytime in the Profile page
            </p>
          </>
        )}

        {/* Error State */}
        {status === "error" && (
          <>
            <div style={{ fontSize: "4rem", marginBottom: "1rem", color: "#dc3545", textAlign: "center" }}>⚠️</div>
            <h2 style={{ textAlign: "center" }}>Registration Failed</h2>
            <p style={{ color: "#dc3545", marginBottom: "1.5rem", textAlign: "center" }}>
              {error || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => setStatus("form")}
              style={{
                width: "100%",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
