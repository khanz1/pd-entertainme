import { Favorite, Movie, Recommendation, sequelize } from "../../models";
import { openaiClient } from "../../lib/openai";
import { z } from "zod";
import { logger } from "../../utils/logger";
import * as movieService from "./movie.service";

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

    const MovieRecommendation = z.object({
      recommendation: z.array(z.string()),
    });

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
              recommendation: { type: "array", items: { type: "string" } },
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
    const recommendations = (data as z.infer<typeof MovieRecommendation>)
      .recommendation;
    const movies = [];
    for (const recommendation of recommendations) {
      logger.debug(
        { recommendation, userId },
        "calculateRecommendations: Searching for movie in TMDB"
      );
      const movie = await movieService.searchMovieFromTMDB(recommendation);
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

        movies.push(createdMovie);
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
          movieId: movie.id,
        },
        defaults: {
          userId,
          movieId: movie.id,
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
