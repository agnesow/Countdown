# Countdown

A single-page countdown timer app built with Angular 21. Displays an auto-sizing event name, live countdown, and a random quote. Event data is persisted in localStorage.

## Prerequisites

- Node.js (v18+)
- npm

## Setup

```bash
npm install
```

## Development

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser. The app will auto-reload on file changes.

## Build

```bash
npm run build
```

Output will be in the `dist/` folder.

## Project Structure

```
src/app/
  app.ts                       # Root component
  app.html                     # Main template
  app.css                      # Component styles
  app.config.ts                # Angular config
  directives/
    text-fit.directive.ts      # Auto-sizing text directive
  services/
    storage.service.ts         # localStorage persistence
    quote.service.ts           # Quote API service
  models/
    types.ts                   # TypeScript interfaces
```
