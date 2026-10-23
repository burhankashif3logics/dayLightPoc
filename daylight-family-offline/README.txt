DAYLIGHT FAMILY WEBSITE EXPORT

Captured on October 23, 2026 (Asia/Karachi) from:
https://daylight-family-prototype.ppdnvmc7g6.chatgpt.site/

OPEN THE OFFLINE COPY
Unzip this archive and open index.html in a modern browser. No installation,
sign-in, server, or internet connection is needed for the planner itself.
The separate daylight-family-offline.html download is the same standalone page.

Navigation, plan editing, assignments, dinner choices and checklists save to
this browser's local storage. They do not update the live site or another device.
Keep using the same file location and browser for saved edits. Private browsing,
blocked storage or clearing browser data can prevent or remove saved edits.
External shopping and venue links still need the internet. A save failure is
shown in the page; keep it open if that happens. Printing uses your browser.

WHAT IS INCLUDED
- index.html: standalone offline adaptation, with all styles and scripts inside.
- saved-plan.json: initial plan reconstructed from the visible weekend, next-week,
  dinner, preparation and task views, with the deployed client's sample defaults.
- client-source/app.js: unchanged readable JavaScript from the deployed page.
- client-source/styles.css: unchanged styles from the deployed page.
- client-source/index.html: HTML shell assembled for those original client files.

SOURCE AVAILABILITY
The signed-in deployed page exposes readable client JavaScript and CSS. These
files are editable. The complete original source repository is not available
through the connected Sites account: both project listing and discovery returned
no matching project. Server code, the /api/plan implementation, authentication,
database contents/history and hosting/build configuration were not recovered.
This archive is not the full original editable server project.

The original client-source files still expect /api/plan from the original server;
use the top-level index.html for offline operation. The offline adaptation changes
the shared-plan load/save functions to browser storage, removes background polling,
and labels its local-only behavior. Cloudflare's injected challenge script and
authentication/session information are not included.

CAPTURE LIMITS
The seed contains the fields exposed by the pages inspected, not a database backup.
The live plan can change during or after capture; this is a point-in-time copy.
Other prototype screens and sample content already present in the client script
are retained. No source repository or backend was modified.
