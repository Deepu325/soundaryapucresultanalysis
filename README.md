# SPUC Result Analysis Dashboard

## Overview

This project is a React-based result analysis dashboard developed for **SPUC** (Second Pre-University College) to visualize II PU examination performance. It is designed to help administrators and teachers review student performance by section, subject, and overall ranking, with powerful visual summaries and fast access to the top performers.

## Key Features

- ** Toppers Page:** Displays top performers in college, science, commerce, and section views.
- ** Section Wise Analysis:** Provides detailed section analytics with result distribution and performance cards.
- ** Subject Analysis Ready:** Supports future section-and-subject result breakdown with clear UX structure.
- **Sidebar Navigation:** Clean side menu for fast access to key analysis pages.
- **Responsive Design:** Works on both desktop and tablet layouts.

## Project Structure

- `src/App.js` - Main dashboard app logic and view switching.
- `src/App.css` - Dashboard styling and sidebar layout.
- `public/students.json` - Student result dataset used by the app.
- `src/index.js` - React entry point.

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
3. Open the app in your browser:
   ```
   http://localhost:3000
   ```

## Available Pages

- **Toppers** — College and stream top-10 student rankings.
- **Section Wise Analysis** — Detailed section metrics with pie chart distribution.
- **Section and Subject Analysis** — Planned support for combined section/subject insights.
- **Subject Wise Result Analysis** — Planned view for subject-level performance reporting.

## Data Details

- The app reads student data from `public/students.json`.
- It calculates section-level statistics including pass rate, distinctions, averages, and top scorers.
- The dashboard supports both science and commerce streams, including extra subject handling for commerce students.

## Tech Stack

- React
- Recharts for charts
- Create React App
- JavaScript, HTML, CSS

## Notes

- The project is tailored for SPUC result analysis and can be extended to add filter controls, export features, and subject-specific charts.
- The current implementation focuses on section-level analysis and results distribution.

## Contact

For updates or customization, modify the components in `src/App.js` and styles in `src/App.css`.
