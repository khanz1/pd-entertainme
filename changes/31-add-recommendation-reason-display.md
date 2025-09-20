# 31 - Add Recommendation Reason Display

## What changed

- Updated `RecommendedMovies.tsx` to display AI recommendation reasons below each movie card.
- Updated `Profile.page.tsx` to show recommendation reasons in both the overview preview and full recommendations tab.
- Enhanced UI with reason cards that explain why each movie was recommended.

## Pros

- Better user experience with transparent AI recommendations.
- Users understand why movies were suggested, building trust in the recommendation system.
- Clean, consistent design for reason display across components.
- Conditional rendering ensures compatibility with existing data.

## Cons

- Slightly increased layout complexity with nested card structures.
- Additional screen space usage for reason display.
- Depends on server providing meaningful reason text.

## Known issues / follow-ups

- Need to ensure recommendation reasons are line-clamped for consistent layout.
- Consider adding expand/collapse for long reasons in the future.

## Technical details

- `RecommendedMovies.tsx`:

  - Wrapped movie cards in containers to accommodate reason display.
  - Added reason cards with "Why we recommend this:" label.
  - Used responsive text sizing and muted styling.

- `Profile.page.tsx`:

  - Updated both overview preview and full recommendations sections.
  - Added Sparkles icon to AI reasoning labels.
  - Used consistent styling with muted backgrounds and borders.
  - Maintained grid layouts while accommodating reason cards.

- Styling approach:
  - `bg-muted/50` for subtle reason card backgrounds.
  - `text-xs` for compact reason text.
  - `leading-relaxed` for better text readability.
  - Conditional rendering with `recommendation.reason &&` checks.

## Commit message

```
feat(ui): display AI recommendation reasons in movie cards

• add reason display to RecommendedMovies component
• show recommendation explanations in Profile page
• enhance UX with transparent AI reasoning
• maintain responsive layouts with nested card structures
```
