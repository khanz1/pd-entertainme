import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database";

interface RecommendationAttributes {
  id: number;
  userId: number;
  movieId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RecommendationCreationAttributes
  extends Optional<
    RecommendationAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}

class Recommendation
  extends Model<RecommendationAttributes, RecommendationCreationAttributes>
  implements RecommendationAttributes
{
  public id!: number;
  public userId!: number;
  public movieId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Serialize to camelCase for JSON responses
  // public override toJSON(): object {
  //   const values = { ...this.get() };
  //   return {
  //     id: values.id,
  //     userId: values.userId,
  //     movieId: values.movieId,
  //     createdAt: values.createdAt,
  //     updatedAt: values.updatedAt,
  //   };
  // }
}

Recommendation.init(
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
    modelName: "Recommendation",
    tableName: "recommendations",
    indexes: [
      {
        unique: true,
        fields: ["userId", "movieId"],
        name: "unique_user_movie_recommendation",
      },
    ],
  }
);

export default Recommendation;
