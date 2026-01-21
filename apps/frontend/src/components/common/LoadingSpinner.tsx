/**
 * LoadingSpinner Component
 * 
 * Simple, reusable loading indicator for consistent UX
 */

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  text?: string;
}

export function LoadingSpinner({ size = "medium", text }: LoadingSpinnerProps) {
  const sizeMap = {
    small: "16px",
    medium: "24px",
    large: "48px"
  };

  const spinnerSize = sizeMap[size];

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      gap: "0.5rem",
      padding: "1rem"
    }}>
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: `3px solid #f3f3f3`,
          borderTop: `3px solid #007bff`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}
      />
      {text && <p style={{ margin: 0, color: "#666", fontSize: "0.875rem" }}>{text}</p>}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
