# Daymark

A calm, responsive To-Do app for keeping track of the things that matter. It runs entirely in your browser and saves tasks in local storage—no server, account, or build step required.

## Features

- Add tasks with an optional note.
- Mark tasks complete, edit them, or delete them.
- Filter by all, to-do, and completed tasks.
- Search task titles and notes; use `⌘ K` (or `Ctrl K`) to focus search.
- See completion progress at a glance.
- Keep tasks between visits on the same browser and device.

## Run locally

Open `index.html` in a browser, or serve this folder with any static file server.

## Deploy to GitHub Pages

The GitHub Actions workflow in `.github/workflows/deploy.yml` publishes the site whenever a commit is pushed to `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

## API planning document

`PrateekJain_Task32.docx` contains the original Express.js REST API planning assignment. This static Pages version is a browser-only implementation of the task experience; it does not make requests to an Express API.
