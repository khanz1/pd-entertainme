import sequelize from "../config/database";
import User from "./User";
import Movie from "./Movie";
import Genre from "./Genre";
import Favorite from "./Favorite";
import MovieGenre from "./MovieGenre";
import Recommendation from "./Recommendation";
import RecommendationQueue from "./RecommendationQueue";

// Define associations
// User - Favorites relationship (One-to-Many)
User.hasMany(Favorite, {
  foreignKey: "userId",
  as: "favorites",
  onDelete: "CASCADE",
});

Favorite.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Movie - Favorites relationship (One-to-Many)
Movie.hasMany(Favorite, {
  foreignKey: "movieId",
  as: "favorites",
  onDelete: "CASCADE",
});

Favorite.belongsTo(Movie, {
  foreignKey: "movieId",
  as: "movie",
});

// Movie - Genre relationship (Many-to-Many through MovieGenre)
Movie.belongsToMany(Genre, {
  through: MovieGenre,
  foreignKey: "movieId",
  otherKey: "genreId",
  as: "genres",
});

Genre.belongsToMany(Movie, {
  through: MovieGenre,
  foreignKey: "genreId",
  otherKey: "movieId",
  as: "movies",
});

// MovieGenre associations
MovieGenre.belongsTo(Movie, {
  foreignKey: "movieId",
  as: "movie",
});

MovieGenre.belongsTo(Genre, {
  foreignKey: "genreId",
  as: "genre",
});

Movie.hasMany(MovieGenre, {
  foreignKey: "movieId",
  as: "movieGenres",
  onDelete: "CASCADE",
});

Genre.hasMany(MovieGenre, {
  foreignKey: "genreId",
  as: "movieGenres",
  onDelete: "CASCADE",
});

// User - Movie relationship through Favorites (Many-to-Many)
User.belongsToMany(Movie, {
  through: Favorite,
  foreignKey: "userId",
  otherKey: "movieId",
  as: "favoriteMovies",
});

Movie.belongsToMany(User, {
  through: Favorite,
  foreignKey: "movieId",
  otherKey: "userId",
  as: "favoritedByUsers",
});

// User - Movie relationship through Recommendations (Many-to-Many)
User.belongsToMany(Movie, {
  through: Recommendation,
  foreignKey: "userId",
  otherKey: "movieId",
  as: "recommendedMovies",
});

Movie.belongsToMany(User, {
  through: Recommendation,
  foreignKey: "movieId",
  otherKey: "userId",
  as: "recommendedByUsers",
});

Recommendation.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Recommendation.belongsTo(Movie, {
  foreignKey: "movieId",
  as: "movie",
});

// User - RecommendationQueue relationship (One-to-Many)
User.hasMany(RecommendationQueue, {
  foreignKey: "userId",
  as: "recommendationQueues",
  onDelete: "CASCADE",
});

RecommendationQueue.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export {
  sequelize,
  User,
  Movie,
  Genre,
  Favorite,
  MovieGenre,
  Recommendation,
  RecommendationQueue,
};

export default {
  sequelize,
  User,
  Movie,
  Genre,
  Favorite,
  MovieGenre,
  Recommendation,
  RecommendationQueue,
};
