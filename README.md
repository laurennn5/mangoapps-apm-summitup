
# SummitUp

## Overview

SummitUp is a responsive employee communications prototype built for the MangoApps Associate Product Manager (AI Builder) take-home assessment. It serves Summit Retail Group, a fictional retailer with approximately 200 staff across five stores.

Workplace updates are scattered across texts, printed notices, and meetings. Employees can miss important information, while managers lack a reliable acknowledgment record. SummitUp brings relevant announcements into one feed and tracks explicit acknowledgment of Important updates.

## Getting Started

SummitUp is built with React, Vite, JavaScript, and CSS. It requires Node.js 22.12 or later and npm.

### Option 1: GitHub Codespaces (Recommended)

You can run SummitUp directly from GitHub without downloading the project to your computer.

1. On this repository's GitHub page, click the green **Code** button.
2. Select the **Codespaces** tab and click **Create codespace on main**.
3. Once Codespaces opens, open the terminal (**Terminal → New Terminal**).
4. Run the following commands:

    ```bash
    npm ci
    npm run dev
    ```

5. Select the **Ports** tab in Codespaces, find port **5173**, and click **Open in Browser**.

SummitUp should now open in a new browser tab.

### Option 2: Run Locally

If you prefer to run the project on your computer:

1. Install [Node.js](https://nodejs.org/) 22.12 or later, which includes npm.
2. Download or clone this repository and open its folder in a terminal.
3. Run:

    ```bash
    npm ci
    npm run dev
    ```

4. Open `http://localhost:5173` in your browser. This is the local address where the application runs on your computer.

### Viewing the Mobile Layout

SummitUp is designed to work on both desktop and mobile screens. To preview the mobile layout on your computer:

1. Open SummitUp in your browser.
2. Press **F12** or **Ctrl + Shift + I** to open Developer Tools.
3. Press **Ctrl + Shift + M** to toggle device emulation, or click the phone/tablet icon in Developer Tools.
4. Select a mobile device or adjust the screen dimensions to explore the responsive layout.

### Testing and Building

The following commands are optional and can be run from the project folder:

```bash
npm test          # Run automated tests
npm run build     # Create a production build
npm run preview   # Preview the production build
```

Automated tests cover store targeting, publishing permissions, acknowledgment tracking, and browser storage.

## Features

- **Operations Manager:** Publishes announcements to an individual store or all stores. Tracks acknowledgment counts and percentages, with searchable employee status lists showing names, initials avatars, and assigned stores.
- **Store Manager:** Publishes announcements automatically targeted to their assigned store. Views that store's acknowledgment results, including responses to company-wide announcements.
- **Employee:** Receives relevant store and company-wide announcements, with search and Important/General filters. Opens Important updates to acknowledge them and can revisit acknowledged announcements without confirming again.

The **Demo as** selector lets reviewers switch identities without creating accounts. Announcements and acknowledgments persist after refreshing the page. Records use stable employee IDs rather than names.

Acknowledgment counts exclude managers: the mock roster contains 195 employees and five Store Managers, with a separate Operations Manager identity.

## Product Decisions & Assumptions

The scenario contrasts Rachel's need for accountability as a Store Manager with Alex's desire, as a Sales Associate, to avoid unnecessary interruptions. Only Important announcements require acknowledgment; routine General updates need no confirmation. The Attention section highlights Important announcements that require acknowledgment. Once acknowledged, these announcements remain accessible under Important and All updates with an Acknowledged status. When no pending announcements remain, the Attention section disappears.

I assumed each employee has one primary store. Restricting Store Managers to local publishing gives them ownership of relevant updates, while reserving company-wide publishing for Operations limits unnecessarily broad messages. These are prototype decisions to validate with the customer.

Acknowledgment records an explicit confirmation of reading, not proof of understanding. I prioritized the complete publishing-to-acknowledgment workflow over additional features so reviewers can evaluate this tradeoff directly.

## Limitations & Future Considerations

Real authentication, account registration, a backend database, cross-device synchronization, push notifications, automated reminders, employee comments or questions, and profile customization were intentionally excluded to keep the prototype focused within the assignment's development constraints. Client-side demo permissions are not a security boundary.

SummitUp uses mock data and browser `localStorage`, so changes do not synchronize across browsers or devices. If storage is unavailable, changes last only for the current session. To reset demo data, remove `summitup.workspace.v1` in browser developer tools and reload. Removing `summitup.identity` also resets the selected identity to Drew.

Before expanding the product, I would clarify which announcements warrant acknowledgment, whether deadlines or escalation are needed, and how employees should ask follow-up questions or provide feedback.
