import {
  Favorite,
  Movie,
  Recommendation,
  RecommendationQueue,
} from "../../models";
import { openaiClient } from "../../lib/openai";
import { logger } from "../../utils/logger";
import * as movieService from "./movie.service";
import { movieRecommendationQueue } from "./recommendation.queue";
import { QueueJobName } from "../../queue";

const getPrompt = (movieTitles: string[]) => {
  return `
  Generate a movie recommendation list of 5-15 movie titles that are similar to the following: 
  ${movieTitles.join(", ")}.
  `;
};

export const calculateRecommendations = async (userId: number) => {
  try {
    //? get all movies that the user has favorited - takes only movie title
    const favoritedMovies = await Favorite.findAll({
      where: {
        userId,
      },
      include: [
        {
          model: Movie,
          as: "movie",
        },
      ],
    });

    const movieTitles = favoritedMovies.map((favorite) => favorite.movie.title);
    logger.info(
      { movieTitles, userId },
      "calculateRecommendations: Starting with user's favorite movie references"
    );

    // generate a prompt for the openai api - result all recommendations movie min 5 max 15 - movie title only
    const prompt = getPrompt(movieTitles);

    logger.debug(
      { prompt, userId },
      "calculateRecommendations: Generated OpenAI prompt"
    );

    const response = await openaiClient.responses.parse({
      model: "gpt-5-nano",
      input: [
        {
          role: "system",
          content: "Extract the movie recommendation information.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "recommendation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              recommendation: {
                type: "array",
                items: {
                  required: ["title", "reason"],
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    reason: { type: "string" },
                  },
                  additionalProperties: false,
                },
              },
            },
            required: ["recommendation"],
            additionalProperties: false,
            $schema: "http://json-schema.org/draft-07/schema#",
          },
        },
      },
    });
    const data = response.output_parsed;
    logger.info(
      { recommendations: data, userId },
      "calculateRecommendations: Received AI movie recommendations"
    );
    if (!data) {
      logger.warn(
        { userId },
        "calculateRecommendations: No recommendations received from AI"
      );
      return;
    }

    // search movie using tmdb api /search/movie
    const recommendations = (
      data as { recommendation: { title: string; reason: string }[] }
    ).recommendation;
    const movies = [];
    for (const recommendation of recommendations) {
      logger.debug(
        { recommendation, userId },
        "calculateRecommendations: Searching for movie in TMDB"
      );
      const movie = await movieService.searchMovieFromTMDB(
        recommendation.title
      );
      if (movie.results.length > 0) {
        const movieDetail = await movieService.getMovieFromTMDBById(
          movie.results[0].id
        );

        logger.debug(
          { movieTitle: movieDetail?.title, userId },
          "calculateRecommendations: Creating movie and genres in database"
        );
        const { createdMovie } = await movieService.createMovieAndGenres(
          movieDetail
        );

        movies.push({
          recommendationTitle: recommendation.title,
          recommendationReason: recommendation.reason,
          movie: createdMovie,
        });
      }
    }

    await Recommendation.destroy({
      where: {
        userId,
      },
      cascade: true,
      truncate: true,
    });

    logger.info(
      { movieCount: movies.length, userId },
      "calculateRecommendations: Creating user recommendations"
    );

    // Insert new recommendations
    for (const movie of movies) {
      await Recommendation.findOrCreate({
        where: {
          userId,
          movieId: movie.movie.id,
        },
        defaults: {
          userId,
          movieId: movie.movie.id,
          reason: movie.recommendationReason,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    logger.info(
      { userId, recommendationCount: movies.length },
      "calculateRecommendations: Successfully completed recommendation generation"
    );

    return movies;
  } catch (err) {
    logger.error(
      { error: err, userId },
      "calculateRecommendations: Failed to calculate recommendations"
    );
    throw err;
  }
};

export const addQueue = async (userId: number) => {
  try {
    logger.info(
      { userId },
      "addQueue: Adding recommendation queue job for user"
    );

    // Add job to BullMQ queue
    const job = await movieRecommendationQueue.add(
      QueueJobName.MOVIE_RECOMMENDATION,
      { userId },
      {
        attempts: 3,
        backoff: {
          type: "fixed",
          delay: 60000,
        },
      }
    );

    logger.info(
      { jobId: job.id, userId },
      "addQueue: Job added to BullMQ queue"
    );

    // Insert record to RecommendationQueue table
    const queueRecord = await RecommendationQueue.create({
      jobId: job.id!,
      userId,
      status: "queue",
      processingTime: 0,
    });

    logger.info(
      { jobId: job.id, userId, queueRecordId: queueRecord.id },
      "addQueue: Successfully created queue record"
    );

    return {
      jobId: job.id,
      queueRecord,
    };
  } catch (err) {
    logger.error(
      { error: err, userId },
      "addQueue: Failed to add recommendation queue"
    );
    throw err;
  }
};

export type TQueueStatus = "queue" | "process" | "done";

export const updateQueue = async (
  jobId: string,
  status: TQueueStatus,
  processingTime?: number
) => {
  try {
    logger.info(
      { jobId, status, processingTime },
      "updateQueue: Updating queue status"
    );

    const updateData: Partial<{
      status: TQueueStatus;
      processingTime: number;
      updatedAt: Date;
    }> = {
      status,
      updatedAt: new Date(),
    };

    // If status is 'done', update processing time
    if (status === "done" && processingTime !== undefined) {
      updateData.processingTime = processingTime;
    }

    const [updatedRowsCount] = await RecommendationQueue.update(updateData, {
      where: { jobId },
    });

    if (updatedRowsCount === 0) {
      logger.warn(
        { jobId, status },
        "updateQueue: No queue record found for jobId"
      );
      return null;
    }

    const recommendationQueue = await RecommendationQueue.findOne({
      where: { jobId },
    });

    if (recommendationQueue) {
      await recommendationQueue.update({
        status,
        updatedAt: new Date(),
      });
    }

    logger.info(
      { jobId, status, processingTime, recordId: recommendationQueue?.id },
      "updateQueue: Successfully updated queue status"
    );

    return recommendationQueue;
  } catch (err) {
    logger.error(
      { error: err, jobId, status },
      "updateQueue: Failed to update queue status"
    );
    throw err;
  }
};
