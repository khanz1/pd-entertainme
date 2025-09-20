import { Queue, QueueEvents, Worker } from "bullmq";
import {
  calculateRecommendations,
  updateQueue,
} from "./recommendation.service";
import { QueueList } from "../../queue";
import IORedis from "ioredis";
import { Env } from "../../config/env";
import { logger } from "../../utils/logger";

const connection = new IORedis(Env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const movieRecommendationQueue = new Queue(
  QueueList.CREATE_RECOMMENDATION_QUEUE,
  { connection }
);

const worker = new Worker(
  QueueList.CREATE_RECOMMENDATION_QUEUE,
  async (job) => {
    const startTime = Date.now();

    logger.info(
      { jobId: job.id, userId: job.data.userId },
      "Movie recommendation job: starting processing"
    );

    await updateQueue(job.id!, "process");

    try {
      await calculateRecommendations(job.data.userId);

      const processingTime = Math.floor((Date.now() - startTime) / 1000);

      await updateQueue(job.id!, "done", processingTime);
    } catch (error) {
      logger.error(
        { error, jobId: job.id, userId: job.data.userId },
        "Movie recommendation job: failed during processing"
      );
      throw error;
    }
  },
  {
    connection,
  }
);

const queueEvents = new QueueEvents(QueueList.CREATE_RECOMMENDATION_QUEUE, {
  connection,
});

queueEvents.on("waiting", ({ jobId }: { jobId: string }) => {
  logger.info({ jobId }, "Movie recommendation job: waiting");
});

queueEvents.on("completed", ({ jobId }: { jobId: string }) => {
  logger.info({ jobId }, "Movie recommendation job: completed successfully");
});

queueEvents.on(
  "failed",
  ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
    logger.error(
      { jobId, failedReason },
      "Movie recommendation job: failed with error"
    );
  }
);
