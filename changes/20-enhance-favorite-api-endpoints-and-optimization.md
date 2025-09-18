# 20 - Enhance Favorite API Endpoints and Optimization

## Changes Made

### Files Created

- `pd-entertainme/server/src/apis/favorite/schema/get-by-movie.schema.ts` - New schema for getFavoriteByMovie validation

### Files Updated

- `pd-entertainme/server/src/apis/favorite/favorite.controller.ts` - Added Swagger docs and new endpoint
- `pd-entertainme/server/src/apis/favorite/favorite.router.ts` - Added new route for getFavoriteByMovie
- `pd-entertainme/server/src/apis/favorite/favorite.test.ts` - Added comprehensive tests for both endpoints
- `pd-entertainme/client/src/features/movies/movie.api.ts` - Added client-side API endpoints
- `pd-entertainme/client/src/pages/MovieDetail.page.tsx` - Optimized to use specific endpoint

### What was Changed, Fixed or Added

## 1. **Swagger Documentation Enhancement**

### getFavoriteById Endpoint Documentation

```yaml
/api/favorites/{id}:
  get:
    summary: Get Favorite by ID
    description: Retrieve a specific favorite movie by its favorite record ID
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: integer
        description: Favorite record ID
    responses:
      200: # Favorite retrieved successfully
      400: # Invalid favorite ID
      401: # Authentication required
      404: # Favorite not found
```

### getFavoriteByMovie Endpoint Documentation

```yaml
/api/favorites/movie/{tmdbId}:
  get:
    summary: Get Favorite by Movie TMDB ID
    description: Retrieve a user's favorite record using TMDB movie ID
    parameters:
      - name: tmdbId
        in: path
        required: true
        schema:
          type: integer
        description: TMDB movie ID
    responses:
      200: # Favorite found for the movie
      400: # Invalid TMDB ID
      401: # Authentication required
      404: # Movie not favorited by user
```

## 2. **New API Endpoint: getFavoriteByMovie**

### Purpose

- **Efficiency**: Get specific favorite by movie TMDB ID instead of fetching all favorites
- **Performance**: Reduces payload size and database queries
- **Specific Use Case**: Perfect for MovieDetail page to check favorite status

### Implementation

```typescript
export const getFavoriteByMovie = withErrorHandler<AuthenticatedRequest>(
  async (req, res) => {
    const { tmdbId } = await GetFavoriteByMovieSchema.parseAsync(req.params);

    const favorite = await Favorite.findOne({
      where: { userId: req.user!.id },
      include: [
        {
          model: Movie,
          as: "movie",
          where: { tmdbId },
          include: [
            {
              model: Genre,
              as: "genres",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!favorite) {
      throw new NotFoundError("Favorite not found for this movie");
    }

    res.json({ status: ApiResponseStatus.SUCCESS, data: favorite });
  }
);
```

### Route Configuration

```typescript
// Order matters: specific routes before dynamic ones
favoriteRouter.get("/movie/:tmdbId", FavoriteController.getFavoriteByMovie);
favoriteRouter.get("/:id", FavoriteController.getFavoriteById);
```

## 3. **Database Relationship Fixes**

### Fixed Model Associations

The `getFavoriteById` endpoint was failing due to incorrect model associations:

**Before (Incorrect):**

```typescript
// Trying to include Genre directly on Favorite
{
  model: Genre,
  as: "genres", // ❌ Genre is not directly related to Favorite
}
```

**After (Correct):**

```typescript
// Include Genre through Movie relationship
{
  model: Movie,
  as: "movie",
  include: [
    {
      model: Genre,
      as: "genres", // ✅ Genre is related to Movie
      through: { attributes: [] }, // Exclude junction table
    },
  ],
}
```

### Database Relationship Structure

```
Favorite ─── belongsTo ──► User
    │
    └─── belongsTo ──► Movie ─── belongsToMany ──► Genre
                                     (through MovieGenre)
```

## 4. **Comprehensive Test Coverage**

### Added Test Cases

#### getFavoriteById Tests

- ✅ **Success Case**: Return specific favorite with all relationships
- ✅ **Not Found**: 404 when favorite doesn't exist
- ✅ **Validation**: 400 for invalid favorite ID
- ✅ **Authentication**: 401 for unauthenticated requests

#### getFavoriteByMovie Tests

- ✅ **Success Case**: Return favorite by TMDB ID with correct data
- ✅ **Not Found**: 404 when movie is not favorited by user
- ✅ **Validation**: 400 for invalid TMDB ID
- ✅ **Authentication**: 401 for unauthenticated requests

### Test Implementation

```typescript
describe("GET /api/favorites/movie/:tmdbId", () => {
  it("should return favorite for a specific movie by TMDB ID", async () => {
    const tmdbId = 385687; // Movie favorited in beforeAll
    const response = await request(app)
      .get(`/api/favorites/movie/${tmdbId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.movie.tmdbId).toBe(tmdbId);
    expect(response.body.data.userId).toBeDefined();
  });
});
```

## 5. **Client-Side API Integration**

### New RTK Query Endpoints

```typescript
// Added to movie.api.ts
getFavoriteById: builder.query<{ status: string; data: any }, number>({
  query: (favoriteId) => `/favorites/${favoriteId}`,
  providesTags: (_, __, favoriteId) => [{ type: "Favorite", id: favoriteId }],
}),

getFavoriteByMovie: builder.query<{ status: string; data: any }, number>({
  query: (tmdbId) => `/favorites/movie/${tmdbId}`,
  providesTags: (_, __, tmdbId) => [{ type: "Favorite", id: `movie-${tmdbId}` }],
}),
```

### Enhanced Cache Management

```typescript
// Updated addFavorite invalidation
invalidatesTags: (_, __, arg) => [
  "Favorite",
  "Movie",
  { type: "Favorite", id: `movie-${arg.tmdbId}` } // Specific cache invalidation
],
```

## 6. **MovieDetail Page Optimization**

### Before (Inefficient)

```typescript
// Fetched ALL user favorites
const { data: favoritesResponse } = useGetFavoritesQuery(undefined, {
  skip: !isAuthenticated,
});

// Found specific favorite by filtering
const currentFavorite = favorites.find((fav) => fav.movie.tmdbId === movieId);
```

### After (Optimized)

```typescript
// Fetch ONLY the specific favorite for this movie
const { data: favoriteResponse } = useGetFavoriteByMovieQuery(movieId, {
  skip: !isAuthenticated,
});

// Direct access to favorite data
const currentFavorite = favoriteResponse?.data;
```

### Performance Benefits

- **Reduced Payload**: Only fetch needed data vs. entire favorites list
- **Faster Response**: Single targeted query vs. fetch-all-then-filter
- **Lower Bandwidth**: Especially beneficial for users with many favorites
- **Better UX**: Faster page load times

## 7. **Input Validation Schema**

### New Schema for Movie Lookup

```typescript
// get-by-movie.schema.ts
export const GetFavoriteByMovieSchema = z.object({
  tmdbId: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val), {
      message: "TMDB ID must be a number",
    }),
});
```

### Validation Features

- **Type Conversion**: String to number transformation
- **Validation**: Ensures valid numeric TMDB ID
- **Error Messages**: Clear feedback for invalid inputs

## Technical Benefits

### ✅ Performance Improvements

- **Database Efficiency**: Targeted queries instead of full table scans
- **Network Optimization**: Reduced payload sizes
- **Cache Efficiency**: Specific cache keys for better invalidation

### ✅ Developer Experience

- **Type Safety**: Full TypeScript support for new endpoints
- **API Documentation**: Comprehensive Swagger documentation
- **Test Coverage**: Complete test suite for reliability

### ✅ User Experience

- **Faster Load Times**: Optimized data fetching
- **Better Responsiveness**: Reduced network overhead
- **Reliable State**: Proper cache invalidation

### ✅ Code Quality

- **Single Responsibility**: Each endpoint has a specific purpose
- **Error Handling**: Comprehensive error scenarios covered
- **Maintainability**: Clear separation of concerns

## API Usage Examples

### 1. Get Favorite by ID

```bash
GET /api/favorites/123
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "id": 123,
    "userId": 1,
    "movieId": 456,
    "movie": { ... },
    "user": { "id": 1, "name": "John Doe" }
  }
}
```

### 2. Get Favorite by Movie TMDB ID

```bash
GET /api/favorites/movie/550
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "id": 123,
    "userId": 1,
    "movieId": 456,
    "movie": {
      "tmdbId": 550,
      "title": "Fight Club",
      "genres": [{"id": 18, "name": "Drama"}]
    }
  }
}
```

## Migration Notes

### Breaking Changes

- **None**: All changes are additive and backward compatible

### Deployment Considerations

- **Database**: No schema changes required
- **Client**: Optional optimization - existing code still works
- **Caching**: New cache keys for improved invalidation

## Future Enhancements

### Potential Improvements

1. **Batch Operations**: Get favorites for multiple movies at once
2. **Caching Strategy**: Redis caching for frequently accessed favorites
3. **Real-time Updates**: WebSocket notifications for favorite changes
4. **Analytics**: Track favorite patterns for recommendations

## Git Commit Message

```
feat(favorites): add getFavoriteByMovie endpoint and optimize MovieDetail page

• Add comprehensive Swagger documentation for getFavoriteById endpoint
• Create new getFavoriteByMovie endpoint for efficient movie-specific queries
• Fix database relationship issues in getFavoriteById model associations
• Add complete test coverage for both favorite retrieval endpoints
• Optimize MovieDetail page to use specific endpoint instead of fetching all favorites
• Enhance RTK Query cache management with specific invalidation tags
• Create validation schema for movie-based favorite lookup
• Improve API performance by reducing payload size and database queries
• Add TypeScript support for new client-side API endpoints

BREAKING CHANGE: None - all changes are backward compatible
```
