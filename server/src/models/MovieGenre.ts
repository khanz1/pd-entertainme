import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database";

interface MovieGenreAttributes {
  id: number;
  movieId: number;
  genreId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MovieGenreCreationAttributes
  extends Optional<MovieGenreAttributes, "id" | "createdAt" | "updatedAt"> {}

class MovieGenre
  extends Model<MovieGenreAttributes, MovieGenreCreationAttributes>
  implements MovieGenreAttributes
{
  public id!: number;
  public movieId!: number;
  public genreId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MovieGenre.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "movies",
        key: "id",
      },
      validate: {
        notNull: true,
        isInt: true,
      },
    },
    genreId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "genres",
        key: "id",
      },
      validate: {
        notNull: true,
        isInt: true,
      },
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
    modelName: "MovieGenre",
    tableName: "movie_genres",
    indexes: [
      {
        unique: true,
        fields: ["movieId", "genreId"], // Composite unique constraint
      },
      {
        fields: ["movieId"], // Index for faster movie lookups
      },
      {
        fields: ["genreId"], // Index for faster genre lookups
      },
    ],
  }
);

export default MovieGenre;
