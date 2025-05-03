# Pages & Routing

## Main Pages
- **Home Page**: Landing page with app intro, sign up/sign in options, and featured venues/items.
- **Registration / Sign-In Page**: User registration and login forms, including avatar upload and home location input.
- **Restaurant/Bar Page**: Displays venue info, menu items (with categories/custom fields), ratings, and "tried" status. Option to add new menu items via OCR or manually.
- **Menu Scanning Page**: Upload/take menu photo, run OCR, review/edit extracted items, and save to DB.
- **User Lists / History Page**: Shows user's tried and rated items, with filters by venue, category, and rating.
- **Admin Dashboard**: (You only) Data cleanup, venue/menu moderation, and user management.

## Routing (Next.js App Router)
- `/` — Home
- `/auth` — Registration/Sign-In
- `/restaurants/[id]` — Restaurant/Bar details and menu
- `/restaurants/[id]/scan` — Menu scanning/upload for a venue
- `/user/[id]` — User profile, lists, and history
- `/admin` — Admin dashboard (protected)

## User Flows
1. **Sign Up / Sign In**: User registers or logs in, sets up profile.
2. **Add Venue**: User adds a new restaurant/bar, optionally using location or Google Maps search.
3. **Scan Menu**: User uploads/takes menu photo, runs OCR, reviews/edits, and saves menu items.
4. **Rate/Mark Items**: User rates menu items, adds text reviews, marks as "tried".
5. **View History**: User browses their tried/rated items and venues.

## Mobile-First PWA Design
- Responsive layouts using TailwindCSS.
- Touch-friendly UI components.
- Add-to-home-screen and offline support.
- Fast loading and smooth navigation.
