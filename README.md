# SummitUp

A responsive employee communications prototype for Summit Retail Group: five stores, 200 people, one place for workplace updates.

Built with React, Vite, JavaScript, plain CSS, and realistic mock data. No backend, authentication, or external API is required. Fonts are bundled locally.

## Run locally

Use Node.js 22.12+ (Node 24 recommended) and npm.

```sh
cd /workspace/mangoapps-apm-summitup
npm ci
npm run dev
```

Vite uses port 5173 by default. Open the running application using your development environment’s port preview, or `http://localhost:5173` when running on your own computer.

```sh
npm test         # Validate staff counts, manager identities, and store targeting
npm run build    # Create the production bundle in dist/
npm run preview  # Serve the production build on port 4173
```

## Try the prototype

- Start as Avery Johnson, a Downtown employee. Browse all updates, filter Important or General, and search by content or category.
- Open any announcement to read its details; press Escape or close the dialog to return.
- Use the identity menu in the upper-right corner to choose a manager or employee at any of the five stores.
- A manager sees an overview with store statistics, relevant announcements, and the five-store directory. Use Announcements to open the same store-scoped employee feed.
- Choose a different store to see its local updates alongside company-wide announcements.
- Reload to verify that the selected identity persists. To reset, clear the `summitup.identity` localStorage entry. If browser storage is unavailable, switching still works for the current session.
- Resize to a phone width to check the mobile layout.

## Project structure

- `src/data.js`: the five stores, 200 staff records, ten selectable demo identities, announcements, and store targeting helper.
- `src/main.jsx`: identity switching, employee feed, search/filter state, read-only detail dialog, and manager overview.
- `src/styles.css`: responsive styling.
- `tests/data.test.js`: data and audience checks using Node’s built-in test runner.

This phase is read-only. Publishing, acknowledgment actions, acknowledgment tracking, and real file downloads are intentionally deferred. The attachment is labeled as a sample. All people and announcement content are fictional; dates are fixed sample data. localStorage stores only the demo identity selection.
