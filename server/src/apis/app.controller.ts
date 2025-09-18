import type { Request, Response } from "express";

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health Check
 *     description: Returns the current health status of the application server, including uptime, environment, and version information. This endpoint is used for monitoring and load balancer health checks.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               status: "healthy"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *               uptime: 3600.5
 *               environment: "production"
 *               version: "1.0.0"
 *       503:
 *         description: Service unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               statusCode: 503
 *               status: "error"
 *               message: "Service temporarily unavailable"
 */
export const getHealth = (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  });
};
