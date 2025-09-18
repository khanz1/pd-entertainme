import app from "./app";
import { Env } from "./config/env";
// import "./models"; // Import models to initialize associations
import sequelize from "./config/database";

const port = Env.PORT;
async function bootstrap() {
  try {
    console.log("🚀 Starting Entertain Me Server...");
    console.log(`📦 Environment: ${Env.NODE_ENV}`);
    console.log(`📍 Port: ${port}`);
    
    // Database connection
    console.log("🔗 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connection established");
    
    // Database synchronization
    console.log("🔄 Synchronizing database models...");
    await sequelize.sync({ force: false });
    console.log("✅ Database models synchronized");
    
    // Start server
    console.log("🌐 Starting HTTP server...");
    app.listen(port, () => {
      console.log(`✅ Server successfully started`);
      console.log(`📡 API Base URL: http://localhost:${port}/api`);
      console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
      console.log(`🔍 Health Check: http://localhost:${port}/api/health`);
      console.log("🎬 Entertain Me Server is ready to serve requests!");
    });
    
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

void bootstrap();
