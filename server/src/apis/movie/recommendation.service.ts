import { Favorite, Movie, Recommendation } from "../../models";
import { openaiClient } from "../../lib/openai";
import { z } from "zod";
import { logger } from "../../utils/logger";
import * as movieService from "./movie.service";

export const calculateRecommendations = async (userId: number) => {
  try {
    // get all movies that the user has favorited - takes only movie title
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
    console.log(
      "1. [calculateRecommendations] Movie references >>>",
      movieTitles
    );

    const MovieRecommendation = z.object({
      recommendation: z.array(z.string()),
    });

    // generate a prompt for the openai api - result all recommendations movie min 5 max 15 - movie title only
    const prompt = `
  Generate a movie recommendation list of 5-15 movie titles that are similar to the following: 
  ${movieTitles.join(", ")}.
  `;

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
    console.log(
      "2. [calculateRecommendations] Movie Recommendations >>>",
      data
    );
    if (!data) {
      logger.info({
        message: "No recommendations found",
        level: "info",
      });
      return;
    }

    // search movie using tmdb api /search/movie
    const recommendations = (data as z.infer<typeof MovieRecommendation>)
      .recommendation;
    const movies = [];
    for (const recommendation of recommendations) {
      console.log(
        "3. [calculateRecommendations] Start searching movie >>>",
        recommendation
      );
      const movie = await movieService.searchMovieFromTMDB(recommendation);
      if (movie.results.length > 0) {
        const movieDetail = await movieService.getMovieFromTMDBById(
          movie.results[0].id
        );

        console.log(
          "4. [calculateRecommendations] Inserting movie >>>",
          movieDetail?.title
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

    console.log(
      "5. [calculateRecommendations] Creating recommendations >>>",
      movies
    );
    // Insert new recommendations
    await Recommendation.bulkCreate(
      movies.map((movie) => ({
        userId,
        movieId: movie.id,
      }))
    );

    return movies;
  } catch (err) {
    console.log(err, "<<< [calculateRecommendations] error");
    throw err;
  }
};
