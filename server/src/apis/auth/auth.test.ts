import { describe, it, expect, afterAll, beforeAll } from "@jest/globals";
import request from "supertest";
import app from "../../app";
import { ApiResponseStatus } from "../app.type";
import sequelize from "../../config/database";
import { User } from "../../models";
import { AuthError } from "./auth.controller";
import { signToken, verifyToken } from "../../utils/crypto";

let accessToken: string;
const userSeed = {
  name: "Xavier Evans",
  email: "assistance.xavier@gmail.com",
  password: "Admin123!",
  profilePict:
    "https://i.pinimg.com/736x/65/93/24/659324a53937e7e47e2ff13a99f5902f.jpg",
};

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  const user = await User.create(userSeed);
  accessToken = signToken({ id: user.id });
});

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    it("201 Created when registration payload is valid", async () => {
      const validUser = {
        name: "Sora",
        email: "assistance.khanz@gmail.com",
        password: "Admin123!",
        profilePict:
          "https://i1.sndcdn.com/artworks-000104065460-zyembt-t500x500.jpg",
      };
      const response = await request(app)
        .post("/api/auth/register")
        .send(validUser);
      expect(response.status).toBe(201);
      expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      expect(response.body.data.user.name).toBe(validUser.name);
      expect(response.body.data.user.email).toBe(validUser.email);
      expect(response.body.data.user.profilePict).toBe(validUser.profilePict);
    });

    it("400 Bad Request when 'name' is empty", async () => {
      const invalidNameUser = {
        name: "",
        email: "assistance.xavier@gmail.com",
        password: "Admin123!",
        profilePict:
          "https://i.pinimg.com/736x/65/93/24/659324a53937e7e47e2ff13a99f5902f.jpg",
      };
      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidNameUser);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe("Name is required");
    });

    it("400 Bad Request when 'email' is empty", async () => {
      const invalidEmailUser = {
        name: "Xavier Evans",
        email: "",
        password: "Admin123!",
        profilePict:
          "https://i.pinimg.com/736x/65/93/24/659324a53937e7e47e2ff13a99f5902f.jpg",
      };
      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidEmailUser);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe("Email is required");
    });

    it("400 Bad Request when 'email' format is invalid", async () => {
      const invalidEmailUser = {
        name: "Xavier Evans",
        email: "assistance.xavier",
        password: "Admin123!",
        profilePict:
          "https://i.pinimg.com/736x/65/93/24/659324a53937e7e47e2ff13a99f5902f.jpg",
      };
      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidEmailUser);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe("Invalid email format");
    });

    it("400 Bad Request when 'password' is empty", async () => {
      const invalidPasswordUser = {
        name: "Xavier Evans",
        email: "assistance.xavier@gmail.com",
        password: "",
        profilePict:
          "https://i.pinimg.com/736x/65/93/24/659324a53937e7e47e2ff13a99f5902f.jpg",
      };
      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidPasswordUser);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe("Password is required");
    });

    it("400 Bad Request when 'password' is shorter than 6 characters", async () => {
      const invalidPasswordLengthUser = {
        name: "Xavier Evans",
        email: "assistance.xavier@gmail.com",
        password: "12345",
        profilePict:
          "https://i.pinimg.com/736x/65/93/24/659324a53937e7e47e2ff13a99f5902f.jpg",
      };
      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidPasswordLengthUser);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe(
        "Password must be at least 6 characters long"
      );
    });

    it("400 Bad Request when 'email' already exists", async () => {
      const userSeed = {
        name: "Xavier Evans",
        email: "assistance.xavier@gmail.com",
        password: "Admin123!",
        profilePict:
          "https://i.pinimg.com/736x/65/93/24/659324a53937e7e47e2ff13a99f5902f.jpg",
      };
      const response = await request(app)
        .post("/api/auth/register")
        .send(userSeed);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe("Email already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    it("200 OK with user payload and accessToken when credentials are valid", async () => {
      const userSeed = {
        email: "assistance.xavier@gmail.com",
        password: "Admin123!",
      };
      const response = await request(app)
        .post("/api/auth/login")
        .send(userSeed);

      console.log(response.body, "<<< erccc");
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      expect(response.body.data.user.email).toBe(userSeed.email);
      expect(response.body.data.accessToken).toBeDefined();
      const data = verifyToken(response.body.data.accessToken);
      expect(data).toBeDefined();
    });

    it("400 Bad Request when 'email' is empty", async () => {
      const invalidEmailUser = {
        email: "",
        password: "Admin123!",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(invalidEmailUser);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe("Email is required");
    });

    it("400 Bad Request when 'password' is empty", async () => {
      const invalidPasswordUser = {
        email: "assistance.xavier@gmail.com",
        password: "",
      };
      const response = await request(app)
        .post("/api/auth/login")
        .send(invalidPasswordUser);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe("Password is required");
    });

    it("400 Bad Request when 'email' format is invalid", async () => {
      const invalidEmailUser = {
        email: "assistance.xavier",
        password: "Admin123!",
      };
      const response = await request(app)
        .post("/api/auth/login")
        .send(invalidEmailUser);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe("Invalid email format");
    });

    it("400 Bad Request when 'password' is shorter than 6 characters", async () => {
      const invalidPasswordUser = {
        email: "assistance.xavier@gmail.com",
        password: "Admin",
      };
      const response = await request(app)
        .post("/api/auth/login")
        .send(invalidPasswordUser);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe(
        "Password must be at least 6 characters long"
      );
    });

    it("401 Unauthorized when 'email' does not exist", async () => {
      const invalidEmailUser = {
        email: "assistance.zakhaev@gmail.com",
        password: "Admin123!",
      };
      const response = await request(app)
        .post("/api/auth/login")
        .send(invalidEmailUser);
      expect(response.status).toBe(401);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe(AuthError.INCORRECT_EMAIL_OR_PASSWORD);
    });

    it("401 Unauthorized when 'password' is incorrect", async () => {
      const invalidPasswordUser = {
        email: "assistance.xavier@gmail.com",
        password: "Admin1234!",
      };
      const response = await request(app)
        .post("/api/auth/login")
        .send(invalidPasswordUser);
      expect(response.status).toBe(401);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe(AuthError.INCORRECT_EMAIL_OR_PASSWORD);
    });
  });

  describe("POST /api/auth/login/google", () => {
    it("400 Bad Request when code is missing", async () => {
      const response = await request(app)
        .post("/api/auth/login/google")
        .send({});
      expect(response.status).toBe(400);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toContain("Code is required");
    });
  });

  describe("GET /api/auth/me", () => {
    it("200 OK when user is authenticated", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe(ApiResponseStatus.SUCCESS);
      expect(response.body.data.user.email).toBe(userSeed.email);
      expect(response.body.data.user.name).toBe(userSeed.name);
      expect(response.body.data.user.profilePict).toBe(userSeed.profilePict);
    });

    it("401 Unauthorized when token is missing", async () => {
      const response = await request(app).get("/api/auth/me");
      expect(response.status).toBe(401);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
      expect(response.body.message).toBe("Invalid token");
    });

    it("401 Unauthorized when token is invalid", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid_token");
      expect(response.status).toBe(401);
      expect(response.body.status).toBe(ApiResponseStatus.ERROR);
    });
  });
});

afterAll(async () => {
  await User.destroy({
    where: {},
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  await sequelize.close();
});
