import { Queue, QueueEvents, Worker } from "bullmq";
import { calculateRecommendations } from "./recommendation.service";
import { QueueJobName } from "../../queue";
import IORedis from "ioredis";
import { Env } from "../../config/env";
import { logger } from "../../utils/logger";

const connection = new IORedis(Env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const movieRecommendationQueue = new Queue(
  QueueJobName.MOVIE_RECOMMENDATION,
  { connection }
);

const worker = new Worker(
  QueueJobName.MOVIE_RECOMMENDATION,
  async (job) => {
    const jobs = await movieRecommendationQueue.getJobs(["waiting"], 0, 100);

    logger.debug(
      { waitingJobs: jobs.length },
      "Movie recommendation queue: checking waiting jobs"
    );
    if (job.name === QueueJobName.MOVIE_RECOMMENDATION) {
      logger.info(
        { jobId: job.id, userId: job.data.userId },
        "Movie recommendation job: starting processing"
      );
      await calculateRecommendations(job.data.userId);
    }
  },
  {
    connection,
  }
);

const queueEvents = new QueueEvents(QueueJobName.MOVIE_RECOMMENDATION, {
  connection,
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
