# 🎯 Amiram Test Tracker - The Path to Exemption

A modern web application designed to track and manage progress for the **Amiram** English placement test. The app allows students to log scores, visualize improvement over time, and know exactly how many courses remain until achieving the desired exemption.

## ✨ Key Features

* **📊 Visual Progress Chart:** A dynamic line chart displaying scores over time using `Recharts`, including reference lines for different English levels (Exemption, Advanced A, Advanced B).
* **🏆 Automatic Level Calculation:** The system automatically calculates your current level based on the **average of your last 3 tests** and displays the remaining courses required.
* **💾 Local Persistence:** Data is saved to the browser's `LocalStorage`, ensuring your progress is kept even after refreshing the page.
* **📥 Data Export:** One-click export of your entire score history to a **CSV (Excel)** file.
* **📱 Responsive Design:** A clean, modern UI optimized for both mobile and desktop, built with **Tailwind CSS**.
* **⚡ High Performance:** Built on top of **Vite** for lightning-fast loading and development.

## 🛠️ Tech Stack

This project is built using the latest web technologies:

* **[React 19](https://react.dev/)** - UI Library.
* **[TypeScript](https://www.typescriptlang.org/)** - For type-safe code.
* **[Vite](https://vitejs.dev/)** - Next Generation Frontend Tooling.
* **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework.
* **[Recharts](https://recharts.org/)** - Composable charting library for React.
* **[Lucide React](https://lucide.dev/)** - Beautiful & consistent icons.

## 🚀 Installation & Setup

1.  **Install Dependencies:**
    Open your terminal in the project folder and run:
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    To start the app locally:
    ```bash
    npm run dev
    ```

3.  **Build for Production:**
    To create an optimized build for deployment:
    ```bash
    npm run build
    ```

## 📂 Project Structure

```text
src/
├── App.tsx       # Main component & business logic
├── index.css     # Global styles & Tailwind directives
├── main.tsx      # Application entry point
└── vite-env.d.ts # TypeScript definitions for Vite