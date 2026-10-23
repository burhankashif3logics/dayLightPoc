# Daylight — Family OS, Phase 1 proof of concept

A working prototype of the Phase 1 app for the Hamilton family, built as a React web app inside a
390×844 device frame so it opens from a link on a call.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production bundle
```

## What this is, and what it is not

Phase 1 ships React Native + Expo against Supabase. This repository is a **web POC**: it exists to
put the interaction model in front of Alicia before the build starts, and to shape the Phase 2
ranking. The component tree is kept portable — domain logic and state live in `src/domain` and
`src/store` with no DOM in them — but this is not the shipping app.

There is no backend, no accounts and no network. The Hamilton family's week is seeded in
`src/domain/seed.ts` from the client's Daylight prototype export and saved to this browser's
`localStorage`. It re-seeds each day so the demo always reads as today, and the family panel beside
the phone resets it.

## The idea the prototype is testing

A family obligation is a **coupon** with named fields, and a state change **stamps itself** onto it.
Nothing disappears — it cancels. An item nobody has answered reads UNCLAIMED; an assignment that
has gone out but not come back reads WAITING; a refusal reads DECLINED with the reason printed
underneath. A ride is one coupon with two owned legs divided by a perforation, so the drop-off and
the pickup can belong to different people — including someone with no account.

## Scope coverage

| # | Scope module | In this POC |
| --- | --- | --- |
| 1 | Accounts and family setup | **Screen only.** The family panel beside the phone switches who is holding it; the Family screen lists members, roles and what a child account holds. No sign-in. |
| 2 | Tasks and events | **Working.** Due dates, time and place, owner, status, notes, priority flag, checklist. Weekly repeats with a single-occurrence override (basketball practice moves one week on its own). |
| 3 | Ownership and coordination | **Working.** Assign, accept, decline with a reason, reassign, comments with @mention, full activity history, Handled log. |
| 4 | Rides | **Working.** Drop-off and pickup as separate owned legs, each with its own accept/decline. "Ask someone else" composes a real `sms:` message to a grandparent or carpool parent and opens Messages; the leg reads WAITING until a parent records the reply. |
| 5 | Core screens | **Working.** Today, Week, Mine, Family, Handled. |
| 6 | Kid requests | **Working.** A child sends what is needed and by when, with a photo placeholder; a parent converts it into a task or replies and closes it. |
| 7 | Notifications and reminders | **Working in-app.** All six notification types land in the Inbox with mute-by-type; the two reminder defaults are togglable. No push — that is a device capability. |
| 8 | Conflict alerts | **Working.** Derived, never stored: one person in two overlapping events, a dated event with no time, a ride with no driver inside 48 hours. |
| 9 | Beta and release | **Screen only.** The in-app feedback form works; TestFlight, Play, crash reporting and analytics are build-time concerns. |

## Roles

Switch role in the panel beside the phone and the app re-scopes. A **child** sees only their own
work and their own requests, cannot assign to a parent, cannot delete, and is not shown the
family's conflicts. A **parent** sees everything. The **family admin** is a parent with member
management.

## The five open questions

The scope document's open questions are rendered as the product's *current defaults*, not as
decisions. They are marked in `PRODUCT.md` and should be answered at the Monday walkthrough:
kid-to-kid assignment, decline escalation order, the two reminder times, the store name, and
repository ownership.

## Layout

```
src/
  domain/     types, dates, seeded week, derived rules (conflicts, urgency, role scoping)
  store/      reducer, localStorage, toasts
  ui/         coupon, stamp, buttons, sheets, icons — the design system
  screens/    Today, Week, Mine, Family, Handled, item detail, Inbox, Settings
  styles/     tokens.css, base.css, app.css
```

Design decisions are recorded in `../DESIGN.md`; product truth in `../PRODUCT.md`; the direction
contract for this surface in `../.impeccable/surfaces/src-app-tsx.md`.

## Sample content

Every name, task, ride, reason and comment is authored sample data for the Hamilton family. The
photo on Becker's cleats request is a labelled placeholder. Nothing here is a real measurement,
customer or claim.
