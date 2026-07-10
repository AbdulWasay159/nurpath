# NurPath Development Todo List

## Phase 1: Foundational Authenticity & Data Integrity

- [x] **Adhkar Content Audit & Enhancement**
  - [x] Create enhanced adhkar data structure with Reference, Authenticity, Occasion, Benefits
  - [x] Update frontend `adhkar.jsx` to display new fields in expandable sections
  - [x] Create backend `Adhkar` model, controller, and routes
  - [x] Create `seed-adhkar.js` script to populate database with authentic data
  - [ ] Integrate frontend with backend API for adhkar data
  - [ ] Verify all 23 adhkar entries from authentic sources

- [ ] **Hadith Data Standardization**
  - [ ] Create `Hadith` model in backend
  - [ ] Create `Hadith` controller and routes
  - [ ] Implement `HadithCard` and `HadithList` components in frontend
  - [ ] Ensure all hadiths include Arabic, Translation, Source, Book, Chapter, Hadith Number, and Authenticity grading
  - [ ] Filter out weak or fabricated narrations

- [x] **99 Names of Allah Verification**
  - [x] Research and verify 99 Names based on authentic evidence (Quran & Sunnah)
  - [x] Create `NameOfAllah` model, controller, and routes in backend
  - [x] Create `seed-names.js` script with verified data
  - [x] Implement `NamesOfAllah` page in frontend with search and details

- [ ] **Islamic Ruling Uncertainty Flagging**
  - [ ] Implement flagging mechanism in backend
  - [ ] Create admin interface for reviewing flagged content

## Phase 2: Core Quranic Features & Enhancements

- [x] **Quran Bookmarking & Reading Progress**
  - [x] Create Bookmark model for storing user bookmarks
  - [x] Create ReadingProgress model for tracking reading streaks
  - [x] Implement bookmark and progress controllers and routes
  - [x] Create quran-reader page with bookmarking UI

- [x] **Quran Offline Caching**
  - [x] Create quranCache service using IndexedDB
  - [x] Implement cache initialization and data persistence
  - [x] Add cache size estimation functions

- [ ] **Quran Search Functionality**
  - [ ] Implement full-text search in Quran verses
  - [ ] Add search by chapter, verse, or meaning
  - [ ] Create search results page with highlighting

- [x] **Curated Quran Audio Recitation**
  - [x] Create QuranReciter and QuranAudio models
  - [x] Implement audio controller and routes
  - [x] Create quran-audio page with audio player
  - [x] Implement reciter selection and playback controls
  - [x] Create audioCache service for offline playback
  - [x] Add playback rate and volume controls

## Phase 3: UI/UX Polish & Technical Excellence

- [x] **Dark Mode Implementation**
  - [x] Create ThemeContext for global theme management
  - [x] Create theme.js with light and dark color palettes
  - [x] Create theme.css with CSS variables and transitions
  - [x] Create ThemeToggle component
  - [x] Create useThemeColors hook
  - [x] Create AppLayout-updated with theme integration
  - [x] Add system preference detection
  - [x] Add localStorage persistence

- [x] **PWA Enhancements**
  - [x] Create service worker for offline support
  - [x] Create web app manifest
  - [x] Implement install prompt component
  - [x] Add offline page with auto-reconnect
  - [x] Setup caching strategies (Cache First, Network First, Audio Cache)
  - [x] Implement background sync for bookmarks and progress
  - [x] Add push notification support
  - [x] Create serviceWorkerRegister utility functions

- [x] **Notes Feature**
  - [x] Create Note model with tags, themes, and colors
  - [x] Implement note controller with CRUD operations
  - [x] Create note routes with search and filtering
  - [x] Create notes management page component
  - [x] Create notesService for API interactions
  - [x] Implement note creation, editing, and deletion
  - [x] Add pin/unpin functionality
  - [x] Add search and filtering by theme
  - [x] Create export functions (JSON, CSV)
  - [x] Add statistics endpoint

- [ ] **Masjid Features**
  - [ ] Enhance Masjid model with facilities and ratings
  - [ ] Create Review model for masjid reviews
  - [ ] Create PrayerTime model
  - [ ] Implement masjid directory page
  - [ ] Add prayer times display
  - [ ] Add review functionality

- [ ] **Frontend UI/UX Improvements**
- [ ] **Performance Optimization**
- [ ] **API Security & Validation Enhancements**
- [ ] **Comprehensive Testing & Documentation**

## Phase 4: Additional Features & Refinements

- [ ] **Masjid Features**
- [ ] **Notes Feature**
- [ ] **Dark Mode Implementation**
- [ ] **PWA Enhancements**

---

## Quality Checklist

- [ ] TypeScript strictness maintained
- [ ] No duplicate logic
- [ ] Reusable components extracted
- [ ] No breaking changes introduced
- [ ] Type checking passed
- [ ] Linting passed
- [ ] Tests passed
- [ ] Documentation updated
- [ ] Commits incremental and well-organized
