import app from "./app";
import { Env } from "./config/env";
import sequelize from "./config/database";

const port = Env.PORT;
async function bootstrap() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: Env.DATABASE_FORCE_SYNC });

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
