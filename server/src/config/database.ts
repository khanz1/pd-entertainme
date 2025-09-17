import { Sequelize } from "sequelize";
import { Env } from "./env";

// Database configuration using PostgreSQL
const sequelize = new Sequelize(Env.DATABASE_URL, {
  dialect: "postgres",
  logging: Env.NODE_ENV === "development" ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
