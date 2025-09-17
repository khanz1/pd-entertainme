import {
  DataTypes,
  Model,
  type Optional,
  type BelongsToManyAddAssociationMixin,
  type BelongsToManyGetAssociationsMixin,
} from "sequelize";
import sequelize from "../config/database";
import Genre from "./Genre";

interface MovieAttributes {
  id: number;
  tmdbId: number;
  title: string;
  overview?: string;
  releaseDate?: Date;
  posterPath?: string;
  backdropPath?: string;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  adult: boolean;
  originalLanguage?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MovieCreationAttributes
  extends Optional<
    MovieAttributes,
    | "id"
    | "overview"
    | "releaseDate"
    | "posterPath"
    | "backdropPath"
    | "voteAverage"
    | "voteCount"
    | "popularity"
    | "adult"
    | "originalLanguage"
    | "createdAt"
    | "updatedAt"
  > {}

class Movie
  extends Model<MovieAttributes, MovieCreationAttributes>
  implements MovieAttributes
{
  public id!: number;
  public tmdbId!: number;
  public title!: string;
  public overview?: string;
  public releaseDate?: Date;
  public posterPath?: string;
  public backdropPath?: string;
  public voteAverage!: number;
  public voteCount!: number;
  public popularity!: number;
  public adult!: boolean;
  public originalLanguage?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association methods
  public addGenre!: BelongsToManyAddAssociationMixin<Genre, number>;
  public getGenres!: BelongsToManyGetAssociationsMixin<Genre>;

  // Serialize to camelCase for JSON responses
  // public override toJSON(): object {
  //   const values = { ...this.get() };
  //   return {
  //     id: values.id,
  //     tmdbId: values.tmdbId,
  //     title: values.title,
  //     overview: values.overview,
  //     releaseDate: values.releaseDate,
  //     posterPath: values.posterPath,
  //     backdropPath: values.backdropPath,
  //     voteAverage: values.voteAverage,
  //     voteCount: values.voteCount,
  //     popularity: values.popularity,
  //     adult: values.adult,
  //     originalLanguage: values.originalLanguage,
  //     createdAt: values.createdAt,
  //     updatedAt: values.updatedAt,
  //   };
  // }
}

Movie.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tmdbId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      // field: "tmdb_id", // Maps to snake_case column in DB
      validate: {
        notNull: true,
        isInt: true,
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    overview: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    releaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      // field: "release_date", // Maps to snake_case column in DB
    },
    posterPath: {
      type: DataTypes.STRING,
      allowNull: true,
      // field: "poster_path", // Maps to snake_case column in DB
    },
    backdropPath: {
      type: DataTypes.STRING,
      allowNull: true,
      // field: "backdrop_path", // Maps to snake_case column in DB
    },
    voteAverage: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      // field: "vote_average", // Maps to snake_case column in DB
      validate: {
        min: 0,
        max: 10,
      },
    },
    voteCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      // field: "vote_count", // Maps to snake_case column in DB
      validate: {
        min: 0,
      },
    },
    popularity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    adult: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    originalLanguage: {
      type: DataTypes.STRING(10),
      allowNull: true,
      //  field: "original_language", // Maps to snake_case column in DB
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Movie",
    tableName: "movies",
  }
);

export default Movie;
