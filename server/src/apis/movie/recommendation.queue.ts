import { Queue, QueueEvents, Worker } from "bullmq";
import { calculateRecommendations } from "./recommendation.service";
import { QueueJobName } from "../../queue";
import IORedis from "ioredis";
import { Env } from "../../config/env";

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

    console.log(jobs, "<<< waiting");
    if (job.name === QueueJobName.MOVIE_RECOMMENDATION) {
      console.log(`${job.id} starting movie recommendation`);
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
  console.log(`${jobId} done movie recommendation`);
});

queueEvents.on(
  "failed",
  ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
    console.error(`${jobId} error movie recommendation`, failedReason);
  }
);
