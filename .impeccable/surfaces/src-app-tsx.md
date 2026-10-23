---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

Scope: the Daylight / Family OS Phase-1 POC app shell and its five core screens — Today, Week, Mine, Family, Handled — plus item detail, the ride handoff, the kid request, the notification inbox and the conflict surface. Visitor mode: Operate.

Audience: Alicia (family admin) and Taylor (parent) answering on a phone between other things; Parker and Becker (children) in a scoped role view. Job: give every family obligation a named owner and an unambiguous closing moment. Action: accept, decline with a reason, reassign, ask an outside helper, convert a request into a task. Content: the Hamilton family's real week, seeded from the Daylight prototype export. Constraints: 390×844 device frame in the browser; mock store with localStorage; WCAG AA; 44px tap targets; no backend.

Chosen direction: The Coupon Book — the jet-age airline ticket wallet (catalog id `vernacular-ephemera-jet-age-ticket-wallet`), which beat the dealt lead (The Week Board) on both audience identification and product clarity and was locked by the user. Memorable moment: a state change **stamps** itself onto the coupon — nothing disappears, it cancels.

## Direction contract

THESIS: A family obligation is a coupon, and its state is stamped onto it rather than quietly rewritten in a row. The surface refuses the category default of same-size rounded cards whose only status signal is a small coloured pill, and refuses the calendar grid that can show when a thing is but never whether anyone agreed to it. Every item carries its own ruled record of who, when, where, and what has been stamped on it so far.

OWN-WORLD: Coupon stock `#f4f1e9` ground under white coupon bodies ruled by one-pixel hairlines `#d8d2c4`; carrier navy `#102b42` owning the header rail, the primary button and the tab bar; Daylight gold `#e8bb60` for waiting and for the one accent; void red `#c2362d` only for declined and overdue; carbon purple `#4b2e83` for data numerals and for everything a child touches; accepted green `#1d5c3f`. Archivo throughout — condensed tab-caps labels at 10px/0.12em for field names, 17–27px at -0.03em for item titles; Azeret Mono for every number, code, time and amount. Coupons have notched corners and a dashed perforation with punched notch holes where a ride's two legs divide. No gradient, no glass, no card shadow beyond a 1px rule and a soft 5px/16px lift.

STORY: The parent opens the app and sees, in one screen, which coupons are still unstamped. They understand immediately that an obligation with no stamp is nobody's yet; they believe the app will not let one quietly pass; they accept, decline with a reason, reassign, or hand a leg to a grandparent over SMS and watch it read WAITING until they record the reply.

FIRST VIEWPORT: Navy rail, 52px safe-area top, holds the Daylight wordmark, the day in 27px Archivo at -0.045em, and one sentence naming the day's unresolved thing. Below it on the stock ground, a tab-caps section rule reading OPEN with the date at the right. Then the coupon stack: coupon one is the Wednesday basketball ride, hairline-ruled into WHO / WHEN / WHERE fields set in Azeret Mono caps, its drop-off leg stamped WAITING in gold and its pickup leg stamped ACCEPTED in green, the two legs divided by a punched perforation; a two-button footer, "Ask someone else" secondary and "I'll drive" primary navy. Coupon two is the declined tournament cash, DECLINED stamped red across its corner at -7deg with Taylor's reason quoted beneath the fields. Coupon three is Becker's cleats request in carbon purple. The five-tab bar sits fixed at the bottom; the primary action always sits inside the coupon it belongs to, never in a floating button.

FORM: The Coupon Book, the winning challenger over the dealt grounded structures (The Week Board led the roll at index 6; The Answer Queue was my own top-ranked grounded candidate at index 1). Seed key `41714a21`, surface scope, operate mode, code-led. Raises carried in from declined challengers: from The Guide Map, colour commits at region scale — the Handled screen takes a tinted ground across its whole width rather than scattering accent dots; from The Centre Rail, every state reads without colour, because the stamp carries its own word and border weight and survives greyscale.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

Unresolved: the five open questions in the client scope document (kid-to-kid assignment, decline escalation order, default reminder times, store name, repository ownership) are rendered as the product's current defaults and must not be treated as decided.
