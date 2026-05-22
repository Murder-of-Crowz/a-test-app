# A StudyGuide App

A mobile exam prep app built using React Native and Expo. Features flashcards and practice exams drawn from a weighted question bank across several exam categories.

## Tech Stack 
### Current as of 5/21/2026

|  Layer        |  Library / Tool |
|---------------|-----------------|
| Framework     | Expo SDK 55 (React Native 0.83) |
| Navigation    | Expo Router 55 (file-based, typed routes) |
| UI            | React Native core component, @expo/vector-icons |
| Animations    | React Native Animated API, react-native-animated |
| File System   | expo-file-system, expo-asset |
| Gestures      | react-native-gesture-handler |
| Animations    | react-native-reanimated |
| Local DB      | @op-engineering/op-sqlite (SQLCipher) |
| State         | Zustand + AsyncStorage |
| Safe areas    | react-native-safe-area-context |
| Language      | TypeScript 5.9 |
| Notifications | expo-notifications |
| Date Picker   | @react-native-community/datetimepicker |
| Storage       | @react-native-async-storage/async-storage |

### Planned

|  Layer       |  Library / Tool |
|--------------|-----------------|
| UI Library   | React Native Paper |
| Storage      | expo-secure-storage, AsyncStorage |
| IAP          | react-native-purchases |
| Network      | @react-native-community/netinfo |
| i18n         | react-i18next + i18next |
| Tests        | Jest + @testing-library/react-native |


## Project Structure (as of 5/21/2026)
```
a-test-app/
│
├── app/
│    ├── _layout.tsx            # Root stack layout (headerShown: false)
│    ├── index.tsx              # Splash screen with animated logo
│    ├── login.tsx              # Login / registration screen
│    ├── dashboard.tsx          # Home screen with navigation cards
│    ├── flashcards.tsx         # Flashcard study mode
│    ├── exam.tsx               # Weighted 25-question practice exam
│    ├── mockExam.tsx           # Timed 100-question mock exam with ad gate
│    ├── quizSelection.tsx      # Category picker for quiz mode
│    ├── questionData.ts        # Quiz subject/question bank helpers
│    ├── settings.tsx           # (in progress)
│    └── quiz/
│         └── [subjectId].tsx   # Per-category 20-question quiz
│
├── assets/
│    ├── premQ.db               # Premium question bank (SQLite)
│    ├── premQ.version          # Version file for DB update detection
│    ├── questions.csv          # Source of truth — 315 questions, 7 categories
│    └── questions.json         # Generated from CSV; consumed by app screens
│
├── scripts/
│    ├── csv_to_db.py           # CSV → SQLite converter
│    └── csv_to_json.py         # CSV → JSON converter with duplicate detection
│
├── src/
│    ├── premDB.native.ts       # SQLite DB init, version check, question reader
│    ├── premDB.web.ts          # Stub for web builds
│    ├── statsStore.ts          # Zustand store - flashcard ratings, exam/quiz history
│    ├── settingsStore.ts       # Zustand store - Spanish toggle
│    ├── notification.ts        # expo-notifications helpers: permission, schedule, cancel
│    └── theme/
│         ├── colors.tsx        # Design tokens (BRANDS, ACCENTS, BG, etc)
│         └── shadows.ts        # Shadow presets (SHADOW_SM, SHADOW_MD, SHADOW_LG)
│
├── metro.config.js             # Asset extensions + module resolver override
├── app.json
├── eas.json
├── package.json
├── tsconfig.json
└── README.md
```

## Pages

### Layout (`_layout.tsx`)
- `GestureHandlerRootView` wrapper
- `initPremDB()` on launch

### Splash (`index.tsx`)
- Animated logo fade-in with translateY. 
- "Get Started" button routes to `/dashboard` (placeholder - will route to `/login` once auth is wired)

### Login (`login.tsx`)
- Email/password sign-in form.
- Firebase auth **soon**.

### Dashboard (`dashboard.tsx`)
- Personalized greeting with settings cog. 
- Five navigation cards: Flashcards, Quiz, Exam, Mock Exam, Stats
- Resume interrupted exam modal on focus
- Notification permission prompt on first visit

### Flashcards (`flashcards.tsx`)
- Browse all 314 questions one at a time.
- Tap a card to flip between questions and answer. Has optional shuffle toggle to randomize deck order.
- Section selector modal
- Swipe gestures
- Know It/Still Learning rating
- Progress bar
- Stats modal
- Review missed cards mode
- Animated navigation
- Premium DB merge functionality

### Quiz Selection (`quizSelection.tsx`)
- Category list with question count and weight per section.
- Navigates to per-category quiz with section index and title.

### Quiz (`quiz/[subjectId].tsx`)
- 20 questions from the selected category, drawn from free + premium pool
- Answer choices shuffled per question.
- Submit locked until all questions answered.
- Results show score with Retake, New Quiz, and Home options

### Practice Exam (`exam.tsx`)
- 25 questions selected proportionally by category weight.
- Answer choices are shuffled per question.
- Submit is locked until all questions are answered.
- Results show total score and a per-category breakdown with progress bars.
- New Exam button
- Show Missed Only toggle
- Premium DB merge into weighted pool functionality

### Mock Exam (`mockExam.tsx`)
- 100 questions selected proportionally by category weight from free + premium pool
- 90-minute countdown timer — turns yellow at 10 min, red at 5 min, auto-submits at 0
- Free users gated behind a rewarded ad (once per day); premium users get unlimited access
- Pass/fail result at 75% threshold with category breakdown and missed-only toggle
- Results saved to exam history with `type: "mock"`

### Stats (`stats.tsx`)
- Three-tab layout: Flashcards, Exam, Quiz - swipeable or tap to switch.
- Flashcard tab: overall Know It / Still Learning / Unreviewed badges with per-category progress bars.
- Quiz tab: collapsible sections grouped by topic, each showing past attempt scores and timestamps.
- Exam tab: egmented filter (Practice / Mock) with collapsible entries showing per-category breakdown.
- Per-tab reset with double-tap confirmation.
- Data persists via Zustand + AsyncStorage across sessions.

### Settings (`settings.tsx`)
- Account info display (name, email placeholder until auth)
- Daily reminder toggle with inline time picker (expo-notifications)
- Test notification button (dev use)
- Spanish language toggle
- Premium plan badge and Restore Purchase button (RevenueCat placeholder)
- Privacy Policy, Terms of Service, version number
- Sign out confirmation modal

## Question Bank
314 questions across 7 categories, weighted to match the state board exam distribution:

|  Category                      |  Weight   | No. of Qs |
|--------------------------------|-----------|-----------|
| Safety and Infection Control   | 34%       | 90        |
| Skin Care                      | 27%       | 80        |
| Skin Analysis                  | 13%       | 40        | 
| Hair Removal                   | 13%       | 40        |
| Advanced Treatments            | 5%        | 24        |
| Makeup                         | 4%        | 18        |
| Client Consultation            | 4%        | 22        |

### Regenerationmg the JSON
After editing `assets/questions.csv`, regenerate the JSON:

```sh
cd scripts
python csv_to_json.py
```

Outputs to `asset/questions.json`. The script skips incomplete rows and reports detected duplicates based on question.

### CSV Column Format

```csv
Category ID, Category, Question, Correct Answer, Wrong Answer 1, Wrong Answer 2, Wrong Answer 3
```

## Getting Started
### Prerequisite
- Node.js 18+
- Python 3.12.6
- Expo Go app (iOS or Android) or a simulator

### Install
```sh
npm install
```

### Run
```sh
npx expo start
```
Scan the QR code with Expo Go, or press `a` for Android simulator, `i` for iOS simulator.

## Brand Colors
|  **Token**   |  **Hex**  |
|--------------|-----------|
| Brand (navy) | `#1e3a5f` |
| Accent (blue)| `#3b82f6` |