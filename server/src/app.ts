import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import appRouter from "./apis/app.router";
import { globalErrorHandler } from "./utils/error";
import swaggerSpecs from "./config/swagger";
import { Env } from "./config/env";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for Swagger UI
  })
);
app.use(morgan("common"));

// Swagger UI Documentation
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { 
      color: #1f2937; 
      font-size: 2.5rem;
      font-weight: bold;
    }
    .swagger-ui .info .description p { 
      font-size: 1.1rem; 
      line-height: 1.6;
    }
    .swagger-ui .scheme-container { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 10px; 
      color: white;
      margin: 20px;
    }
    .swagger-ui .auth-wrapper .authorize { 
      background: #4f46e5; 
      color: white; 
      border-radius: 6px;
    }
    .swagger-ui .btn.authorize { 
      background: #4f46e5;
      border-color: #4f46e5;
    }
    .swagger-ui .btn.authorize:hover { 
      background: #3730a3;
      border-color: #3730a3;
    }
    .swagger-ui .opblock.opblock-post { border-color: #16a34a; }
    .swagger-ui .opblock.opblock-get { border-color: #2563eb; }
    .swagger-ui .opblock.opblock-delete { border-color: #dc2626; }
    .swagger-ui .opblock.opblock-put { border-color: #ea580c; }
  `,
    customSiteTitle: "Entertain Me API Documentation",
    customfavIcon: "/entertainme-logo.png",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "none",
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      displayOperationId: false,
      deepLinking: true,
      supportedSubmitMethods: ["get", "post", "put", "delete", "patch"],
      validatorUrl: null,
    },
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js",
    ],
  })
);

// API Documentation JSON
app.get("/api/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpecs);
});

// Root API endpoint with documentation link
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to Entertain Me API",
    version: "1.0.0",
    documentation: `${req.protocol}://${req.get("host")}/api/docs`,
    environment: Env.NODE_ENV,
    endpoints: {
      health: "/api/health",
      documentation: "/api/docs",
      authentication: "/api/auth",
      movies: "/api/movies",
      favorites: "/api/favorites",
    },
  });
});

app.use("/api", appRouter);

app.use(globalErrorHandler);

export default app;
