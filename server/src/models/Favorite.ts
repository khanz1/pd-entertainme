import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database";
import Movie from "./Movie";

interface FavoriteAttributes {
  id: number;
  userId: number;
  movieId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface FavoriteCreationAttributes
  extends Optional<FavoriteAttributes, "id" | "createdAt" | "updatedAt"> {}

class Favorite
  extends Model<FavoriteAttributes, FavoriteCreationAttributes>
  implements FavoriteAttributes
{
  public id!: number;
  public userId!: number;
  public movieId!: number;
  public movie!: Movie;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Favorite.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "movies",
        key: "id",
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
    modelName: "Favorite",
    tableName: "favorites",
    indexes: [
      {
        unique: true,
        fields: ["userId", "movieId"],
        name: "unique_user_movie_favorite",
      },
    ],
  }
);

export default Favorite;
