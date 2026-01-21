/**
 * EmptyState Component
 * 
 * Consistent empty state messaging across pages
 */

interface EmptyStateProps {
  message: string;
  icon?: string;
}

export function EmptyState({ message, icon = "📄" }: EmptyStateProps) {
  return (
    <div style={{ 
      padding: "3rem 2rem", 
      textAlign: "center", 
      color: "#666",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      border: "1px dashed #ddd"
    }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{icon}</div>
      <p style={{ margin: 0, fontSize: "1rem" }}>{message}</p>
    </div>
  );
}
