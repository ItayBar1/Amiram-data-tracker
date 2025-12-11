# 🎯 Amiram Test Tracker & Vocabulary Builder

A comprehensive modern web application designed to help students prepare for the **Amiram** English placement test. The app serves two main purposes: tracking test score progress towards an exemption and providing a smart flashcard system for vocabulary retention.

## ✨ Key Features

### 📊 Score Tracker & Analytics
* **Visual Progress:** A dynamic line chart (using `Recharts`) displays your score history over time, with visual reference zones for different English levels (Exemption, Advanced A, Advanced B, etc.).
* **Automatic Level Calculation:** The system calculates your current status based on the average of your last 3 tests and displays how many courses remain until full exemption.
* **History Management:** View a detailed list of past scores with the ability to delete entries.

### 🧠 Smart Vocabulary Flashcards
* **Personalized Word Bank:** Add your own English words and their Hebrew translations to build a custom study list.
* **Focus Mode Grid:** The interface shows a random selection of **9 cards** at a time to prevent overwhelm and ensure focused study.
* **Reshuffle Functionality:** Click the "Reshuffle" button to instantly swap the current grid with a new set of 9 random words from your collection without reloading the page.
* **Smart Flip Logic:**
    * **Auto-Close:** Cards automatically flip back to English after **10 seconds** to test short-term recall.
    * **Single Focus:** Only one card can be open (showing Hebrew) at a time. Clicking a new card immediately closes the previous one.

### 🔐 Authentication & Data Persistence
* **Supabase Integration:** All data (words and scores) is securely stored in a cloud database (Supabase).
* **User Accounts:** Secure Sign-up and Login functionality allows you to access your data from any device.

### 📱 Modern UI/UX
* **Responsive Design:** Fully optimized for both mobile devices (bottom navigation) and desktop (top navigation).
* **Polished Animations:** Smooth CSS 3D transforms for card flipping and loading states.
* **Interactive Feedback:** Uses SweetAlert2 for confirmation dialogs and success messages.

## 🛠️ Tech Stack

This project is built using the latest web technologies:

* **[React 19](https://react.dev/)** - UI Library.
* **[TypeScript](https://www.typescriptlang.org/)** - For robust, type-safe code.
* **[Vite](https://vitejs.dev/)** - Next Generation Frontend Tooling for fast builds.
* **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework for styling.
* **[Supabase](https://supabase.com/)** - Backend-as-a-Service for Authentication and Database.
* **[Recharts](https://recharts.org/)** - Composable charting library.
* **[Lucide React](https://lucide.dev/)** - Beautiful & consistent icons.

## 🚀 Installation & Setup

Follow these steps to run the project locally:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/amiram-data-tracker.git](https://github.com/your-username/amiram-data-tracker.git)
    cd amiram-data-tracker
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run Development Server:**
    To start the app locally:
    ```bash
    npm run dev
    ```
    The app should now be running at `http://localhost:5173`.

4.  **Build for Production:**
    To create an optimized build for deployment:
    ```bash
    npm run build
    ```

## 📂 Project Structure

```text
src/
├── App.tsx             # Main layout and routing logic
├── Auth.tsx            # Login and Signup component
├── TrackerPage.tsx     # Score tracking and Chart visualization
├── Vocab.tsx           # Flashcards, Word list management, and Shuffle logic
├── LoadingIndicator.tsx# Reusable UI spinner component
├── supabase.ts         # Supabase client configuration
├── index.css           # Global styles & Tailwind directives
└── main.tsx            # Application entry point