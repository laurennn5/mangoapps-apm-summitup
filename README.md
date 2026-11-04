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

In GitHub Codespaces, run the commands above from the repository root (usually `/workspaces/mangoapps-apm-summitup`), then open port **5173** from the **Ports** tab using **Open in Browser**.

Vite uses port 5173 by default. On your own computer, open `http://localhost:5173`. In Codex Cloud, open that address inside the environment’s shared desktop browser if a desktop viewer is available; the address does not open the cloud app from your personal browser.

```sh
npm test         # Validate targeting, permissions, acknowledgment counts, and storage
npm run build    # Create the production bundle in dist/
npm run preview  # Serve the production build on port 4173
```

## Try the prototype

Use **Demo as** in the top-right corner. No password or account registration is needed.

- **Michael Torres — Operations Manager:** publish to an individual store or all stores; view acknowledgment progress across the entire targeted audience.
- **Jordan Lee — Store Manager:** publish only to Downtown; view Downtown employee results, including for company-wide announcements.
- **Drew Johnson — Employee:** receives Downtown and all-store updates. Select **Review & acknowledge** on a pending Important card, read the full announcement, and select **Acknowledge**. It leaves Attention but stays in Important and All updates with an Acknowledged status.
- Other store managers and employees remain available for testing store targeting and separate receipts. Operations managers can distinguish employees by the assigned store shown beneath each name in View all, and search by name, store, or status.

For an end-to-end check:

1. As Michael, publish an important announcement to All stores.
2. As Drew, open it and acknowledge it. Confirm it leaves Attention, retains its Important badge, and remains visible through Important and All updates after reload. Reopen it to reread without another acknowledgment action.
3. As Jordan, check that it shows **1 of 43** Downtown employees acknowledged. Use **View all** and search for Drew or `pending`.
4. As Michael, the same announcement shows **1 of 195** employees acknowledged. Switching to another store's employee and acknowledging it increases the company-wide count without changing Jordan's result.
5. As Jordan, create a Downtown announcement. The audience selector must not offer All stores or other stores. A Westside employee should not see this announcement.
6. Publish a general update and confirm there is no acknowledgment action or tracking requirement.
7. Check Important/General filters, search, mobile layout, and dialog dismissal with Escape.

Counts include only targeted records with the employee role: **195 employees across five stores**, plus five store managers. Store Managers and Operations Managers are excluded from every employee acknowledgment denominator. Michael is a separate operations demo identity. Announcements target all stores when their `storeIds` array is empty. Store managers see their own store's subset of a company-wide audience.

## Persistence and scope

`localStorage` retains the selected demo identity in `summitup.identity`. Published announcements and acknowledgment receipts are stored together in `summitup.workspace.v1`. Receipts use stable announcement and employee IDs, never display names. Each employee can acknowledge an important announcement once; general updates require no acknowledgment.

To reset your demo data, remove `summitup.workspace.v1` in browser developer tools and reload. Remove `summitup.identity` to return to Drew. This deletes demo state only in that browser. If storage is unavailable, the app explains that changes last only for the current session. Invalid saved state falls back to samples without overwriting the saved value.

This is a local prototype with simulated role permissions, no backend or authentication, and no synchronization between browsers or devices. Client-side permissions support the demo workflow; they are not a security boundary. Publishing and acknowledgment state persist on the current browser origin. There are no real notifications, comments, or account registration. The sample PDF attachment remains clearly labeled and has no download action.

## Project structure

- `src/data.js`: five stores, staff with stable IDs, demo identities, and sample announcements.
- `src/workflow.js`: role permissions, publishing, audience membership, acknowledgment progress, storage, and deterministic avatar colors.
- `src/main.jsx`: role switching, employee feed, publishing form, acknowledgment actions, manager progress, and searchable employee status dialogs.
- `src/styles.css`: responsive minimalist blue styling.
- `tests/data.test.js` and `tests/workflow.test.js`: staff counts, store targeting, permission boundaries, denominator accuracy, duplicate acknowledgment prevention, storage round trips, and avatar consistency.
