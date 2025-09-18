import swaggerJsdoc from "swagger-jsdoc";
import { Env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Entertain Me API",
      version: "1.0.0",
      description: `
        Your Gateway to Cinematic Excellence
        
        Welcome to the Entertain Me API
        A comprehensive movie discovery platform that leverages artificial intelligence to provide personalized movie recommendations.
        
        Features
        - 🎬 Movie Discovery: Browse thousands of movies with advanced filtering
        - 🤖 AI Recommendations: Get personalized suggestions powered by OpenAI GPT-5 nano
        - ❤️ Favorites Management: Save and organize your favorite movies
        - 🔐 Secure Authentication: JWT-based auth with Google OAuth support
        - ⚡ Queue Processing: Background AI recommendation generation
        
        Getting Started
        1. Authentication: Register or login to get your access token
        2. Browse Movies: Explore our extensive movie catalog
        3. Add Favorites: Build your personal collection
        4. Get Recommendations: Receive AI-powered suggestions
      `,
      contact: {
        name: Env.DOCS_CONTACT_NAME,
        email: Env.DOCS_CONTACT_EMAIL,
        url: Env.DOCS_CONTACT_WEB,
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url:
          Env.NODE_ENV === "production"
            ? Env.DOCS_SERVER_URL
            : `http://localhost:${Env.PORT}`,
        description:
          Env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "JWT authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'",
        },
      },
      schemas: {
        // User Schemas
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
              description: "Unique user identifier",
            },
            name: {
              type: "string",
              example: "John Doe",
              description: "User's full name",
            },
            email: {
              type: "string",
              format: "email",
              example: "john.doe@example.com",
              description: "User's email address",
            },
            profilePict: {
              type: "string",
              format: "url",
              example: "https://example.com/avatar.jpg",
              description: "URL to user's profile picture",
              nullable: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
              description: "Account creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
              description: "Last update timestamp",
            },
          },
          required: ["id", "name", "email", "createdAt", "updatedAt"],
        },

        // Movie Schemas
        Movie: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
              description: "Internal movie ID",
            },
            tmdbId: {
              type: "integer",
              example: 550,
              description: "TMDB (The Movie Database) ID",
            },
            title: {
              type: "string",
              example: "Fight Club",
              description: "Movie title",
            },
            overview: {
              type: "string",
              example:
                "A ticking-time-bomb insomniac and a slippery soap salesman...",
              description: "Movie plot summary",
              nullable: true,
            },
            releaseDate: {
              type: "string",
              format: "date",
              example: "1999-10-15",
              description: "Movie release date",
              nullable: true,
            },
            posterPath: {
              type: "string",
              format: "url",
              example:
                "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
              description: "URL to movie poster image",
              nullable: true,
            },
            backdropPath: {
              type: "string",
              format: "url",
              example:
                "https://image.tmdb.org/t/p/w500/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg",
              description: "URL to movie backdrop image",
              nullable: true,
            },
            voteAverage: {
              type: "number",
              format: "float",
              example: 8.4,
              description: "Average rating (0-10)",
              minimum: 0,
              maximum: 10,
            },
            voteCount: {
              type: "integer",
              example: 26280,
              description: "Number of votes",
              minimum: 0,
            },
            popularity: {
              type: "number",
              format: "float",
              example: 61.416,
              description: "Movie popularity score",
              minimum: 0,
            },
            adult: {
              type: "boolean",
              example: false,
              description: "Adult content flag",
            },
            originalLanguage: {
              type: "string",
              example: "en",
              description: "Original language code",
              nullable: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
              description: "Record creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
              description: "Record update timestamp",
            },
          },
          required: [
            "id",
            "tmdbId",
            "title",
            "voteAverage",
            "voteCount",
            "popularity",
            "adult",
            "createdAt",
            "updatedAt",
          ],
        },

        // Genre Schema
        Genre: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
              description: "Internal genre ID",
            },
            tmdbId: {
              type: "integer",
              example: 28,
              description: "TMDB genre ID",
            },
            name: {
              type: "string",
              example: "Action",
              description: "Genre name",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
              description: "Record creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
              description: "Record update timestamp",
            },
          },
          required: ["id", "tmdbId", "name", "createdAt", "updatedAt"],
        },

        // Favorite Schema
        Favorite: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
              description: "Favorite record ID",
            },
            userId: {
              type: "integer",
              example: 1,
              description: "User ID who favorited the movie",
            },
            movieId: {
              type: "integer",
              example: 1,
              description: "Movie ID that was favorited",
            },
            movie: {
              $ref: "#/components/schemas/Movie",
              description: "Complete movie details",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
              description: "When the movie was favorited",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
              description: "Last update timestamp",
            },
          },
          required: ["id", "userId", "movieId", "createdAt", "updatedAt"],
        },

        // Recommendation Schema
        Recommendation: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
              description: "Recommendation record ID",
            },
            userId: {
              type: "integer",
              example: 1,
              description: "User ID for whom the movie is recommended",
            },
            movieId: {
              type: "integer",
              example: 1,
              description: "Recommended movie ID",
            },
            movie: {
              $ref: "#/components/schemas/Movie",
              description: "Complete movie details",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
              description: "When the recommendation was generated",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
              description: "Last update timestamp",
            },
          },
          required: ["id", "userId", "movieId", "createdAt", "updatedAt"],
        },

        // Request/Response Schemas
        RegisterRequest: {
          type: "object",
          properties: {
            name: {
              type: "string",
              example: "John Doe",
              description: "User's full name",
              minLength: 1,
              maxLength: 100,
            },
            email: {
              type: "string",
              format: "email",
              example: "john.doe@example.com",
              description: "Valid email address",
            },
            password: {
              type: "string",
              example: "SecurePass123!",
              description: "Password (minimum 6 characters)",
              minLength: 6,
            },
            profilePict: {
              type: "string",
              format: "url",
              example: "https://example.com/avatar.jpg",
              description: "Optional profile picture URL",
            },
          },
          required: ["name", "email", "password"],
        },

        LoginRequest: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john.doe@example.com",
              description: "User's email address",
            },
            password: {
              type: "string",
              example: "SecurePass123!",
              description: "User's password",
              minLength: 6,
            },
          },
          required: ["email", "password"],
        },

        GoogleLoginRequest: {
          type: "object",
          properties: {
            code: {
              type: "string",
              example: "4/0AX4XfWh...",
              description: "Google OAuth authorization code",
            },
          },
          required: ["code"],
        },

        CreateFavoriteRequest: {
          type: "object",
          properties: {
            tmdbId: {
              type: "integer",
              example: 550,
              description: "TMDB movie ID to add to favorites",
            },
          },
          required: ["tmdbId"],
        },

        AuthResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
              enum: ["success"],
            },
            data: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/User",
                },
                accessToken: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  description: "JWT access token for authentication",
                },
              },
              required: ["user", "accessToken"],
            },
          },
          required: ["status", "data"],
        },

        MoviesResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
              enum: ["success"],
            },
            totalPages: {
              type: "integer",
              example: 500,
              description: "Total number of pages available",
            },
            totalResults: {
              type: "integer",
              example: 10000,
              description: "Total number of movies",
            },
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Movie",
              },
              description: "Array of movies",
            },
            dates: {
              type: "object",
              properties: {
                maximum: {
                  type: "string",
                  format: "date",
                  example: "2024-02-15",
                },
                minimum: {
                  type: "string",
                  format: "date",
                  example: "2024-01-01",
                },
              },
              description: "Date range for now_playing movies (optional)",
            },
          },
          required: ["status", "totalPages", "totalResults", "data"],
        },

        MovieDetailResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "success",
              enum: ["success"],
            },
            data: {
              type: "object",
              properties: {
                adult: { type: "boolean", example: false },
                backdropPath: {
                  type: "string",
                  example:
                    "https://image.tmdb.org/t/p/original/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg",
                },
                belongsToCollection: {
                  type: "object",
                  properties: {
                    id: { type: "integer", example: 230 },
                    name: {
                      type: "string",
                      example: "The Godfather Collection",
                    },
                    posterPath: {
                      type: "string",
                      example:
                        "https://image.tmdb.org/t/p/w500/zqV8MGXfpLZiFVObLxpAI5wPdUD.jpg",
                    },
                    backdrop_path: {
                      type: "string",
                      example:
                        "https://image.tmdb.org/t/p/original/3WZTxpgscsmoUk81TuECXdFOD0R.jpg",
                    },
                  },
                  nullable: true,
                },
                budget: { type: "integer", example: 63000000 },
                genres: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Genre" },
                },
                homepage: {
                  type: "string",
                  example: "https://www.foxmovies.com/movies/fight-club",
                },
                id: { type: "integer", example: 550 },
                imdbId: { type: "string", example: "tt0137523" },
                originCountry: {
                  type: "array",
                  items: { type: "string" },
                  example: ["US"],
                },
                originalLanguage: { type: "string", example: "en" },
                originalTitle: { type: "string", example: "Fight Club" },
                overview: {
                  type: "string",
                  example: "A ticking-time-bomb insomniac...",
                },
                popularity: { type: "number", example: 61.416 },
                posterPath: {
                  type: "string",
                  example:
                    "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                },
                productionCompanies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer", example: 508 },
                      logoPath: {
                        type: "string",
                        example:
                          "https://image.tmdb.org/t/p/original/7PzJdsLGlR7oW4J0J5Xcd0pHGRg.png",
                      },
                      name: { type: "string", example: "Regency Enterprises" },
                      originCountry: { type: "string", example: "US" },
                    },
                  },
                },
                productionCountries: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      iso31661: { type: "string", example: "US" },
                      name: {
                        type: "string",
                        example: "United States of America",
                      },
                    },
                  },
                },
                releaseDate: {
                  type: "string",
                  format: "date",
                  example: "1999-10-15",
                },
                revenue: { type: "integer", example: 100853753 },
                runtime: { type: "integer", example: 139 },
                spokenLanguages: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      englishName: { type: "string", example: "English" },
                      iso6391: { type: "string", example: "en" },
                      name: { type: "string", example: "English" },
                    },
                  },
                },
                status: { type: "string", example: "Released" },
                tagline: { type: "string", example: "Mischief. Mayhem. Soap." },
                title: { type: "string", example: "Fight Club" },
                video: { type: "boolean", example: false },
                voteAverage: { type: "number", example: 8.4 },
                voteCount: { type: "integer", example: 26280 },
              },
            },
          },
          required: ["status", "data"],
        },

        HealthResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "healthy",
              enum: ["healthy", "unhealthy"],
            },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
              description: "Current server timestamp",
            },
            uptime: {
              type: "number",
              example: 3600.5,
              description: "Server uptime in seconds",
            },
            environment: {
              type: "string",
              example: "production",
              enum: ["development", "test", "production"],
            },
            version: {
              type: "string",
              example: "1.0.0",
              description: "API version",
            },
          },
          required: ["status", "timestamp", "uptime", "environment", "version"],
        },

        ErrorResponse: {
          type: "object",
          properties: {
            statusCode: {
              type: "integer",
              example: 400,
              description: "HTTP status code",
            },
            status: {
              type: "string",
              example: "error",
              enum: ["error"],
            },
            message: {
              type: "string",
              example: "Validation failed",
              description: "Error message",
            },
            details: {
              type: "object",
              description: "Additional error details",
              nullable: true,
            },
          },
          required: ["statusCode", "status", "message"],
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Health",
        description: "Application health and status endpoints",
      },
      {
        name: "Authentication",
        description: "User authentication and authorization",
      },
      {
        name: "Movies",
        description: "Movie discovery, search, and details",
      },
      {
        name: "Favorites",
        description: "User's favorite movies management",
      },
      {
        name: "Recommendations",
        description: "AI-powered movie recommendations",
      },
    ],
  },
  apis: [
    "./src/apis/**/*.ts",
    ...(process.env.NODE_ENV === "production" ? ["./**/*.js"] : []),
  ],
};

const specs = swaggerJsdoc(options);

export default specs;
