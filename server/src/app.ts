import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import appRouter from "./apis/app.router";
import { globalErrorHandler } from "./utils/error";
import swaggerSpecs from "./config/swagger";
import { Env } from "./config/env";
import { logger } from "./utils/logger";

const app = express()

app.set("trust proxy", true);

morgan.token("real-ip", (req) => {
  const xRealIp = req.headers["x-real-ip"];
  const xForwardedFor = Array.isArray(req.headers["x-forwarded-for"])
    ? req.headers["x-forwarded-for"][0]
    : req.headers["x-forwarded-for"]?.split(",")[0]?.trim();
  const ip = (req as any).ip;
  const remoteAddress = req.socket.remoteAddress;

  return xRealIp || xForwardedFor || ip || remoteAddress;
});

const logFormat =
  ':real-ip - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

app.use(morgan(logFormat));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for Swagger UI
  })
);

app.get("/", (_req, res) => {
  res.redirect("/api/docs");
});

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
      url: "/api/docs.json",
      layout: "StandaloneLayout",
    },
  })
);

app.get("/api", (req, res) => {
  logger.info("API root endpoint accessed");
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
