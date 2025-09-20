import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database";

interface RecommendationQueueAttributes {
  id: number;
  jobId: string;
  userId: number;
  status: "queue" | "process" | "done";
  processingTime: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RecommendationQueueCreationAttributes
  extends Optional<
    RecommendationQueueAttributes,
    "id" | "processingTime" | "createdAt" | "updatedAt"
  > {}

class RecommendationQueue
  extends Model<
    RecommendationQueueAttributes,
    RecommendationQueueCreationAttributes
  >
  implements RecommendationQueueAttributes
{
  public id!: number;
  public jobId!: string;
  public userId!: number;
  public status!: "queue" | "process" | "done";
  public processingTime!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RecommendationQueue.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    jobId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("queue", "process", "done"),
      allowNull: false,
      defaultValue: "queue",
    },
    processingTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    modelName: "RecommendationQueue",
    tableName: "recommendation_queues",
    indexes: [
      {
        unique: true,
        fields: ["jobId"],
        name: "unique_job_id",
      },
      {
        fields: ["userId"],
        name: "idx_user_id",
      },
      {
        fields: ["status"],
        name: "idx_status",
      },
    ],
  }
);

export default RecommendationQueue;
