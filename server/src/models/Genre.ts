import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database";

interface GenreAttributes {
  id: number;
  tmdbId: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface GenreCreationAttributes
  extends Optional<GenreAttributes, "id" | "createdAt" | "updatedAt"> {}

class Genre
  extends Model<GenreAttributes, GenreCreationAttributes>
  implements GenreAttributes
{
  public id!: number;
  public tmdbId!: number;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Genre.init(
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
      validate: {
        notNull: true,
        isInt: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
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
    modelName: "Genre",
    tableName: "genres",
  }
);

export default Genre;
