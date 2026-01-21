import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ResearchDomain, ReadingStage, ImpactScore } from "shared";
import { post, ApiError } from "../services/api";

/**
 * Add Paper Page
 * 
 * Form for adding a new research paper to the library.
 * Collects paper metadata and submits to POST /papers endpoint.
 */

interface AddPaperForm {
  title: string;
  firstAuthor: string;
  researchDomain: ResearchDomain;
  readingStage: ReadingStage;
  citationCount: number;
  impactScore: ImpactScore;
}

export function AddPaper() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AddPaperForm>({
    defaultValues: {
      readingStage: ReadingStage.ABSTRACT_READ
    }
  });

  const onSubmit = async (data: AddPaperForm) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await post<{ id: string }>("/papers", {
        title: data.title,
        firstAuthor: data.firstAuthor,
        researchDomain: data.researchDomain,
        readingStage: data.readingStage,
        citationCount: data.citationCount,
        impactScore: data.impactScore
      });

      setSuccessMessage("Paper added successfully!");

      // Redirect to library after short delay
      setTimeout(() => {
        navigate("/library");
      }, 1500);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "2rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "0.5rem", color: "#1a202c" }}>
          Add Research Paper
        </h1>
        <p style={{ fontSize: "1rem", color: "#718096", maxWidth: "600px", margin: "0 auto" }}>
          Add a new paper to your research library. Track your reading progress, citations, and impact scores.
        </p>
      </div>

      {/* Form Card */}
      <div style={{ 
        maxWidth: "600px", 
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
        padding: "2rem"
      }}>
        {successMessage && (
          <div style={{
            padding: "0.75rem",
            marginBottom: "1.5rem",
            backgroundColor: "#d4edda",
            color: "#155724",
            border: "1px solid #c3e6cb",
            borderRadius: "4px"
          }}>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{
            padding: "0.75rem",
            marginBottom: "1.5rem",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
            borderRadius: "4px"
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
        {/* Paper Details Section */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", color: "#2d3748", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem" }}>
            Paper Details
          </h3>
          
          {/* Paper Title */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="title" style={{ display: "block", marginBottom: "0.25rem", fontWeight: "500", color: "#4a5568" }}>
              Paper Title *
            </label>
          <input
            id="title"
            type="text"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem"
            }}
            {...register("title", { required: "Paper title is required" })}
          />
          {errors.title && (
            <div style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {errors.title.message}
            </div>
          )}
        </div>

          {/* First Author Name */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="firstAuthor" style={{ display: "block", marginBottom: "0.25rem", fontWeight: "500", color: "#4a5568" }}>
              First Author Name *
            </label>
          <input
            id="firstAuthor"
            type="text"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem"
            }}
            {...register("firstAuthor", { required: "First author name is required" })}
          />
          {errors.firstAuthor && (
            <div style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {errors.firstAuthor.message}
            </div>
          )}
        </div>

          {/* Research Domain */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="researchDomain" style={{ display: "block", marginBottom: "0.25rem", fontWeight: "500", color: "#4a5568" }}>
              Research Domain *
            </label>
          <select
            id="researchDomain"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem"
            }}
            {...register("researchDomain", { required: "Research domain is required" })}
          >
            <option value="">-- Select Domain --</option>
            {Object.entries(ResearchDomain).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
          {errors.researchDomain && (
            <div style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {errors.researchDomain.message}
            </div>
          )}
        </div>

        </div>

        {/* Reading Status Section */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", color: "#2d3748", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem" }}>
            Reading Status
          </h3>
          
          {/* Reading Stage */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="readingStage" style={{ display: "block", marginBottom: "0.25rem", fontWeight: "500", color: "#4a5568" }}>
              Reading Stage *
            </label>
          <select
            id="readingStage"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem"
            }}
            {...register("readingStage", { required: "Reading stage is required" })}
          >
            {Object.entries(ReadingStage).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
          {errors.readingStage && (
            <div style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {errors.readingStage.message}
            </div>
          )}
        </div>

        </div>

        {/* Impact & Citations Section */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "1rem", color: "#2d3748", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem" }}>
            Impact & Citations
          </h3>
          
          {/* Citation Count */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="citationCount" style={{ display: "block", marginBottom: "0.25rem", fontWeight: "500", color: "#4a5568" }}>
              Citation Count *
            </label>
          <input
            id="citationCount"
            type="number"
            min="0"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem"
            }}
            {...register("citationCount", {
              required: "Citation count is required",
              min: { value: 0, message: "Citation count must be at least 0" },
              valueAsNumber: true
            })}
          />
          {errors.citationCount && (
            <div style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {errors.citationCount.message}
            </div>
          )}
        </div>

          {/* Impact Score */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="impactScore" style={{ display: "block", marginBottom: "0.25rem", fontWeight: "500", color: "#4a5568" }}>
              Impact Score *
            </label>
          <select
            id="impactScore"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "1rem"
            }}
            {...register("impactScore", { required: "Impact score is required" })}
          >
            <option value="">-- Select Impact Score --</option>
            {Object.entries(ImpactScore).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
          {errors.impactScore && (
            <div style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {errors.impactScore.message}
            </div>
          )}
        </div>

        </div>

        {/* Submit Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #e2e8f0" }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: isSubmitting ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
          >
          {isSubmitting && (
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid #ffffff",
                borderTop: "2px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}
            />
          )}
          {isSubmitting ? "Adding Paper..." : "Add Paper"}
          </button>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </form>
      </div>
    </div>
  );
}
