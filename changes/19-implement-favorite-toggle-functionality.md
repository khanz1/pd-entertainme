# 19 - Implement Favorite Toggle Functionality

## Changes Made

### Files Updated

- `pd-entertainme/client/src/pages/MovieDetail.page.tsx` - Added favorite toggle functionality
- `pd-entertainme/client/src/features/movies/movie.api.ts` - Enhanced API invalidation tags

### What was Changed, Fixed or Added

1. **Favorite State Management**

   - Added `useGetFavoritesQuery` and `useRemoveFavoriteMutation` imports
   - Implemented logic to find the current favorite record by movie tmdbId
   - Added state management for toggling favorite status

2. **Button State Enhancement**

   - Dynamic button variant based on favorite status (default/outline)
   - Visual heart icon with fill state for favorited movies
   - Contextual button text based on current state
   - Proper loading states for both add and remove operations

3. **Toggle Functionality**

   - Replaced `handleAddToFavorites` with `handleToggleFavorite`
   - Added logic to determine add vs remove operation
   - Implemented favorite ID lookup for removal
   - Enhanced error handling and user feedback

4. **API Integration Improvements**

   - Added "Movie" tag invalidation to favorite mutations
   - Ensures movie detail queries refresh when favorites change
   - Maintains data consistency across components

5. **User Experience Enhancements**
   - Clear visual indication of favorite status
   - Appropriate loading messages ("Adding..." vs "Removing...")
   - Improved toast notifications
   - Better error handling and user feedback

## Technical Implementation

### Favorite State Detection

```typescript
// Find the favorite record for this movie
const currentFavorite = favorites.find((fav) => fav.movie.tmdbId === movieId);

// Use both API response and local data for accuracy
const isFavorited = movieDetail.isFavorite && currentFavorite;
```

### Toggle Logic

```typescript
const handleToggleFavorite = async () => {
  if (movieDetail.isFavorite && currentFavorite) {
    // Remove from favorites using favorite ID
    await removeMovieFromFavorites(currentFavorite.id).unwrap();
  } else {
    // Add to favorites using movie tmdbId
    await addMovieToFavorites({ tmdbId: movieDetail.id }).unwrap();
  }
};
```

### Dynamic Button Appearance

```typescript
<Button
  variant={movieDetail.isFavorite ? "default" : "outline"}
  onClick={handleToggleFavorite}
  disabled={isTogglingFavorite}
>
  <Heart
    className={`h-4 w-4 ${movieDetail.isFavorite ? "fill-current" : ""}`}
  />
  {movieDetail.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
</Button>
```

## Visual States

### 1. **Not Favorited State**

- **Appearance**: Outline button with empty heart icon
- **Text**: "Add to Favorites"
- **Action**: Adds movie to favorites

### 2. **Favorited State**

- **Appearance**: Solid button with filled heart icon
- **Text**: "Remove from Favorites"
- **Action**: Removes movie from favorites

### 3. **Loading States**

- **Adding**: "Adding..." with spinner
- **Removing**: "Removing..." with spinner
- **Button**: Disabled during operation

## API Data Flow

### Add Favorite Flow

1. User clicks "Add to Favorites"
2. POST `/api/favorites` with `{ tmdbId: movieId }`
3. API creates favorite record
4. Invalidates "Favorite" and "Movie" tags
5. Movie detail refetches with `isFavorite: true`
6. Button updates to favorite state

### Remove Favorite Flow

1. User clicks "Remove from Favorites"
2. Find favorite record in local favorites list
3. DELETE `/api/favorites/${favoriteId}`
4. API removes favorite record
5. Invalidates "Favorite" and "Movie" tags
6. Movie detail refetches with `isFavorite: false`
7. Button updates to unfavorited state

## Benefits

### ✅ User Experience

- Intuitive toggle behavior
- Clear visual feedback
- Immediate state updates
- Proper loading indicators

### ✅ Data Consistency

- Automatic cache invalidation
- Real-time UI updates
- Synchronized state across components
- Accurate favorite status

### ✅ Performance

- Efficient API calls
- Optimistic UI updates through RTK Query
- Minimal re-renders
- Smart cache management

## Potential Issues and Fixes

### Issue 1: Race Conditions

**Problem**: Rapid clicking might cause inconsistent state
**Fix**: Button is disabled during operations to prevent multiple requests

### Issue 2: Stale Data

**Problem**: Favorite status might not reflect immediately
**Fix**: RTK Query tag invalidation ensures fresh data after mutations

### Issue 3: Missing Favorite ID

**Problem**: Remove operation needs favorite ID, not movie ID
**Fix**: Fetch user favorites and find matching record by tmdbId

## Testing Scenarios

### 1. **Add to Favorites**

- Click "Add to Favorites" button
- ✅ Button shows loading state
- ✅ Toast shows success message
- ✅ Button becomes "Remove from Favorites"
- ✅ Heart icon becomes filled

### 2. **Remove from Favorites**

- Click "Remove from Favorites" button
- ✅ Button shows loading state
- ✅ Toast shows removal message
- ✅ Button becomes "Add to Favorites"
- ✅ Heart icon becomes empty

### 3. **Error Handling**

- Network error during operation
- ✅ Error toast message displayed
- ✅ Button returns to previous state
- ✅ User can retry operation

### 4. **Authentication**

- Unauthenticated user
- ✅ Button not shown
- ✅ Login prompt if clicked (not applicable)

## Git Commit Message

```
feat(movie-detail): implement favorite toggle with dynamic button states

• Add favorite toggle functionality to movie detail page
• Implement dynamic button appearance based on favorite status
• Add heart icon fill state for visual feedback
• Integrate remove favorite functionality with proper ID lookup
• Enhance API cache invalidation for data consistency
• Improve user experience with contextual loading states
• Add proper error handling and toast notifications
```
