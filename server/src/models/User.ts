import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../config/database";
import { comparePassword, hashPassword } from "../utils/crypto";

interface UserAttributes {
  id: number;
  name: string;
  profilePict?: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    "id" | "profilePict" | "createdAt" | "updatedAt"
  > {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public name!: string;
  public profilePict?: string;
  public email!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async validatePassword(plainPassword: string): Promise<boolean> {
    const hashedPassword = this.getDataValue("password");
    if (!hashedPassword) {
      return false;
    }
    return await comparePassword(plainPassword, hashedPassword);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    profilePict: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: "email",
        msg: "Email already exists",
      },
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 255],
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
    modelName: "User",
    tableName: "users",
    hooks: {
      beforeCreate: async (user: User) => {
        const userPassword = user.getDataValue("password");
        if (userPassword) {
          user.setDataValue("password", await hashPassword(userPassword));
        }
      },
      beforeUpdate: async (user: User) => {
        const userPassword = user.getDataValue("password");
        if (user.changed("password") && userPassword) {
          user.setDataValue("password", await hashPassword(userPassword));
        }
      },
    },
  }
);

export default User;
