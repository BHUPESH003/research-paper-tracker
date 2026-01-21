import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AddPaper } from './pages/AddPaper';
import { Library } from './pages/Library';
import { Analytics } from './pages/Analytics';
import { Setup } from './pages/Setup';
import { Profile } from './pages/Profile';
import { useApiKey } from './hooks/useApiKey';

/**
 * Protected Route Component
 * Redirects to setup if user hasn't registered their API key yet
 * Waits for API key to be initialized before rendering
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isReady, apiKey } = useApiKey();
  const isSetupComplete = localStorage.getItem("RPT_SETUP_COMPLETE");
  
  // Wait for API key hook to initialize
  if (!isReady) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }
  
  // Check if setup is complete and API key exists
  if (!isSetupComplete || !apiKey) {
    return <Navigate to="/setup" replace />;
  }
  
  return <>{children}</>;
}

/**
 * Main application component
 * Defines top-level routes and navigation
 */
function App() {
  const isSetupComplete = localStorage.getItem("RPT_SETUP_COMPLETE");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navigation - Only show on main pages, not setup */}
      {isSetupComplete && (
        <nav style={{
          padding: "1rem",
          backgroundColor: "#007bff",
          color: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center"
          }}>
            <Link
              to="/library"
              style={{
                color: "white",
                textDecoration: "none",
                margin: 0,
                fontSize: "1.25rem",
                marginRight: "auto",
                fontWeight: "bold"
              }}
            >
              Research Paper Tracker
            </Link>
            <Link 
              to="/add" 
              style={{ 
                color: "white", 
                textDecoration: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                backgroundColor: "rgba(255,255,255,0.1)",
                transition: "background-color 0.2s"
              }}
            >
              Add Paper
            </Link>
            <Link 
              to="/library" 
              style={{ 
                color: "white", 
                textDecoration: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                backgroundColor: "rgba(255,255,255,0.1)",
                transition: "background-color 0.2s"
              }}
            >
              Library
            </Link>
            <Link 
              to="/analytics" 
              style={{ 
                color: "white", 
                textDecoration: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                backgroundColor: "rgba(255,255,255,0.1)",
                transition: "background-color 0.2s"
              }}
            >
              Analytics
            </Link>
            <Link 
              to="/profile" 
              style={{ 
                color: "white", 
                textDecoration: "none",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                backgroundColor: "rgba(255,255,255,0.2)",
                transition: "background-color 0.2s"
              }}
            >
              Profile
            </Link>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Setup route - public */}
          <Route path="/setup" element={<Setup />} />
          
          {/* Protected routes */}
          <Route path="/add" element={<ProtectedRoute><AddPaper /></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Root redirects to setup or library */}
          <Route path="/" element={
            isSetupComplete ? <Navigate to="/library" replace /> : <Navigate to="/setup" replace />
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
