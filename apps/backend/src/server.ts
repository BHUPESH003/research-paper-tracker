import { createApp } from "./app";

// Read port from environment or use default
const PORT = process.env.PORT || 4000;

// Create and start server
const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
