# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React + TypeScript, device-framed in the browser (390×844 shell). Confirmed by the user on 23 Oct 2026 in preference to Expo React Native for this POC, so the prototype can be opened from a link on a call. Phase 1 production ships React Native + Expo + Supabase + Sentry + PostHog per the signed scope; component structure is kept portable to React Native (no CSS-only layout tricks in feature components, logic separated from presentation), but this repository is a web POC and not the shipping app.

## Users

One household per account. The Hamilton family is the single beta family.

- **Family admin — Alicia.** The parent currently holding the family's logistics in her head. Does everything a parent does, plus inviting members and creating child profiles. Her job: get every open family obligation out of her memory and onto a named owner.
- **Parent — Taylor.** Co-parent. Creates, assigns, accepts, declines, reassigns and completes tasks, events and rides. Often answering on the move, between a work day and a pickup.
- **Child — Parker, Becker.** Sees only their own tasks, marks them done, and sends requests to parents. Cannot assign work to a parent and cannot delete items.
- **Outside helper — grandparent, carpool parent.** Has no account and never will in Phase 1. Receives a pre-filled text message composed on a parent's phone; a parent records the reply by hand.

## Product Purpose

Every family task has an owner, a status and an unambiguous "handled" moment. Phase 1 succeeds when one family runs its week on the app in daily use and generates the feedback that ranks Phase 2 — not when a feature list is complete.

Today the family's logistics are spread across email, text threads, school newsletters and one parent's memory; finding a driver means manual texts; a kid's request dies between the ask and the errand.

## Positioning

Two things a neighboring family-calendar or to-do app does not do:

1. **A task is not done until someone accepted it.** Assignment is a two-sided act — assign, then accept or decline *with a reason*, then reassign — so an unanswered obligation is visibly unanswered instead of silently sitting on a list.
2. **Rides are first-class, and the driver may be someone with no account.** Drop-off and pickup are separate owned slots on an event, with the same accept/decline flow, plus an escape hatch to a grandparent over plain SMS whose reply a parent records.

The "Handled" log is the product's closing gesture: work leaves the active plan to a place where it can be seen to have happened.

## Operating Context

- Phones, in the gaps of a day: a decline answered from a parking lot, a request sent from an iPad at the kitchen table at 9pm.
- The week is driven by school and sport: practice series that repeat for eight weeks and then change for one week, tournaments, Crazy Hat Day, fruit rosters.
- Outside helpers are reached through the phone's own Messages app, not through the product.
- Named screens the family will ask for by name: Today, Week, My tasks, Family tasks, Handled.
- Reminders at 6 PM the day before and 1 hour before (default, pending confirmation). Alert 24 hours before an event that still has no driver.

## Capabilities and Constraints

Phase 1 contract, 9 modules: accounts and family setup; tasks and events (due dates, time and place, owner, status, notes, priority flag, checklist, daily/weekly repeats with single-instance override); ownership and coordination (assign, accept, decline with reason, reassign, comments with @mention, activity history, Handled log); rides (drop-off and pickup driver, accept/decline, "Ask someone else" pre-filled text, parent records the reply); core screens; kid requests (what is needed, by when, optional photo → parent converts to a task or replies); notifications and reminders (6 types, mute by type); conflict alerts (one person in two overlapping events, events with no time, rides with no driver); beta and release.

POC scope confirmed 23 Oct 2026: modules 2–8 work for real against a seeded mock store; accounts, family setup and the beta/release module are present as screens but not functional.

Data: typed in-memory store seeded with the Hamilton family, persisted to localStorage, demo-resettable. No network, no keys, no Supabase in this repository.

Production constraints that shape the design: iOS 16 and Android 10 minimums; each family's data isolated at the database level; sync visible on other devices within 5 seconds; the last loaded plan stays readable offline; core screens load in under 2 seconds with 200 items; child accounts hold only name, photo and tasks; no ads, no data sharing.

Undecided (open questions for the Monday walkthrough, not to be answered by design fiat): whether kids may assign to each other or only request; whether a declined ride escalates to the other parent before the outside-helper list; the default reminder times; the store name; repository ownership.

## Brand Commitments

- The client's **Daylight prototype** (`daylight-family-offline/`, captured 23 Oct 2026) is the binding design reference. Its world: deep navy ground (#102b42), warm off-white shell (#fbfcfa), gold accent (#e8bb60), generous rounded cards, uppercase tracked section labels, a single sans. New work inherits this world rather than replacing it.
- The product name is unsettled: "Family OS" and "Daylight" are both live. Use "Daylight" in the interface, as the prototype does, and keep the name in one place so it can be swapped.
- Voice: plain, specific, unexcited. The prototype says "your co-parent confirmed; family schedule updated," not "Nice work!" No gamification, no streaks, no praise for doing chores.

## Evidence on Hand

- `Family OS kick off meeting.docx` — kickoff transcript.
- The Phase 1 scope document (pasted 23 Oct 2026), version 1.1, including the 9-module contract table and its "done when" criteria.
- `daylight-family-offline/index.html` — the offline prototype export: real styles, real copy, real task content (Crazy Hat Day, Wednesday basketball ride, tournament cash, soccer team fruit).
- `daylight-family-offline/saved-plan.json` — a point-in-time plan seed, not a database backup.

Not on hand and not to be invented: the production backend, auth, schema, the client's logo and final colours, Apple/Google developer accounts, the family's 25 test scenarios, real user counts or any performance measurement. Demo content for the POC is authored at full fidelity and labelled as sample data.

## Product Principles

1. **Nothing sits unowned.** Every item shows a named owner and a status; unanswered is a state the interface renders, not an absence.
2. **The decline is as designed as the accept.** Saying no, with a reason, in one tap, is the feature that makes the product honest.
3. **Closing is visible.** Handled is a destination, not a disappearance.
4. **A child's view is their own.** Scope, permissions and tone change with the role; nothing is hidden behind a disabled control a child cannot use.
5. **The product reaches people who are not in it.** Outside helpers participate over SMS without accounts, and the app tracks the waiting.

## Accessibility & Inclusion

System font sizes honoured; 44pt minimum tap targets; WCAG AA contrast. English only, US date formats, Pacific time in Phase 1.
