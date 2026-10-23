# Daylight — all-ages POC

A second proof of concept for Family OS, built from scratch. It shares no code,
tokens or components with `family-os-poc/`; the coupon-book world is deliberately
not inherited here.

## Why this exists

The team's note was that young children will use this alongside adults. A
child-only design drags the whole product childish, so none of these three worlds
solves legibility with cartoon styling. Each solves it **structurally**:

- every state is a **word, a colour and a shape** at once, so the screen survives
  greyscale, a colour-blind parent and a six-year-old;
- **"nobody has this"** is a texture (hatching) and an empty dashed token, not an
  absence — you see it before you read anything;
- tap targets are 44px and up, body text starts at 14.5px, and nothing critical is
  carried by colour alone.

## Three worlds, one product

The domain, store, rules and every flow are written once. The three worlds are
real presentation systems — different type, palette, density and signature move —
not swapped colour variables.

| World | Lineage | Signature move |
|---|---|---|
| **Almanac** | The newspaper weather page and its key | The **daylight band** — sun-up to sun-down with each obligation pinned at its hour, plus a permanent four-symbol key |
| **Primer** | Mid-century picture-book printing | The **person-token** — a flat two-ink glyph per family member, with a dashed empty token for "no one" |
| **Departures** | Public transport signage programs | The **status plate** — a fixed-width state word with elapsed time on the next unanswered item |

Switch worlds and roles in the rig to the left of the phone. Both are demo
controls and sit outside the product.

## Running it

```
npm install
npm run dev
```

Opens at `http://localhost:5173`. The rig switches design world, switches who is
holding the phone (Alicia, Taylor, Parker, Becker) and resets the demo.

## What works for real

Modules 2–8 of the Phase 1 contract run against a seeded in-memory store that
persists to `localStorage`:

- **Tasks, events and rides** with time, place, owner, priority, checklists and repeats
- **Assign → accept → decline with a reason → reassign**, the two-sided act the
  product is built on
- **Rides with two separately owned legs** — drop-off and pickup answer independently,
  and the ride reports the leg that is still open, never the one already settled
- **Outside helpers over SMS** — the pre-filled text is shown as it would leave the
  phone; a parent records the reply by hand, and until they do it stays *Asked out*
- **Kid requests** — a child asks, a parent converts it to a task or just replies
- **Comments with @mention** and a full activity history per item
- **Conflict alerts** — one person in two places, an event with no time, a ride inside
  24 hours with no driver
- **The Handled log** — nothing is deleted, and anything can be put back on the plan

Accounts, family setup and the beta/release module are out of scope here, as agreed.

## Roles

A child's view is their own scope, not a locked-down parent view. Parker and Becker
see only what is theirs or for them, are asked only about what is actually waiting
on *them*, can mark their own work done, and can ask a parent rather than assign to
one. The no-driver alert stays with the parents, because a child cannot solve it.

## Sample data

The Hamilton family, one week — Crazy Hat Day, the Wednesday basketball ride,
tournament cash, the soccer team fruit. All of it is authored sample content, held
in this browser only. There is no network, no keys and no backend in this project.
