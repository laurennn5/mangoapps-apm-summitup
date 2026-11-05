# SummitUp

## Overview

SummitUp is a mobile-first employee communications prototype built for the MangoApps Associate Product Manager (AI Builder) take-home assessment. It serves Summit Retail Group, a fictional retailer with approximately 200 staff across five stores.

Workplace updates are scattered across texts, printed notices, and meetings. Employees can miss important information, while managers lack a reliable acknowledgment record. SummitUp brings relevant announcements into one feed and tracks explicit acknowledgment of Important updates.

## Getting Started

The application uses React 19, Vite 7, JavaScript, and plain CSS, with locally bundled fonts. Use Node.js 22.12+ and npm; this environment was verified with Node.js 24.22.1 and npm 11.9.0.

From the repository root:

```sh
npm ci
npm run dev
```

Open `http://localhost:5173`. In GitHub Codespaces, open port **5173** from the **Ports** tab using **Open in Browser**.

```sh
npm test         # Run the automated tests
npm run build    # Create the production bundle in dist/
npm run preview  # Serve the production bundle on port 4173
```

Tests cover store targeting, publishing permissions across all five stores, employee-only acknowledgment counts, duplicate prevention, storage round trips, and avatar consistency.

## Features

- **Operations Manager:** Publishes to an individual store or all stores. Tracks counts and percentages, with searchable employee status lists showing names, initials avatars, and assigned stores.
- **Store Manager:** Publishes automatically to their assigned store. Sees that store’s acknowledgment results, including the local response to company-wide announcements.
- **Employee:** Receives relevant store and company-wide announcements, with search and Important/General filters. Opens Important updates to acknowledge them and can reread completed updates without confirming again.

The **Demo as** selector lets reviewers switch identities without creating accounts. Announcement and acknowledgment state persists after refresh. Records use stable employee IDs rather than names. Counts exclude managers: the mock roster contains 195 employees and five Store Managers, with a separate Operations Manager identity.

## Product Decisions & Assumptions

The scenario contrasts Rachel’s need for accountability as a Store Manager with Alex’s desire, as a Sales Associate, to avoid interruptions. Only Important announcements require acknowledgment; routine General updates need no confirmation. Attention contains pending Important updates and disappears when no action remains. Acknowledgment changes the employee’s status, not the announcement’s category, so Important updates remain accessible for reference.

I assumed each employee has one primary store. Restricting Store Managers to local publishing gives them ownership of relevant updates; reserving company-wide publishing for Operations limits unnecessarily broad messages. These are prototype decisions to validate with the customer.

Acknowledgment records an explicit confirmation of reading, not proof of understanding. I prioritized the complete publishing-to-acknowledgment workflow over additional features so reviewers can evaluate this tradeoff directly.

## Limitations & Future Considerations

Real authentication, account registration, a backend database, cross-device synchronization, push notifications, automated reminders, comments or questions, and profile customization were intentionally excluded to keep the assignment focused. Client-side demo permissions are not a security boundary. The sample PDF has no working download.

Mock data and localStorage support this browser only; changes do not synchronize across browsers or devices. If storage is unavailable, changes last for the session. To reset, remove `summitup.workspace.v1` in browser developer tools and reload. Removing `summitup.identity` also resets the selected identity to Drew.

Before expanding the product, I would clarify which announcements warrant acknowledgment, whether deadlines or escalation are needed, and how employees should ask follow-up questions or provide feedback.
