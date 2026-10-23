---
name: Daylight — Family OS
description: A jet-age coupon book for family obligations, where state is stamped onto the ticket rather than rewritten in a row.
colors:
  stock: "#f4f1e9"
  stock-sunk: "#ece7da"
  board: "#d9d3c4"
  coupon: "#ffffff"
  coupon-dim: "#fbfaf6"
  handled-ground: "#e7e3d6"
  navy: "#102b42"
  navy-deep: "#0b1e2e"
  navy-soft: "#27465e"
  ink: "#16222b"
  ink-2: "#3f5465"
  ink-3: "#566476"
  rule: "#d7d1c3"
  rule-soft: "#e7e2d6"
  rule-navy: "#37536b"
  gold: "#e8bb60"
  gold-ink: "#74550f"
  gold-wash: "#fdf7e9"
  void: "#c2362d"
  void-ink: "#8d231c"
  void-wash: "#fcf1ef"
  go: "#1c5a3e"
  go-wash: "#eff7f1"
  carbon: "#4b2e83"
  carbon-wash: "#f0ecf8"
  spent: "#5c666e"
  spent-wash: "#eeece6"
  terracotta: "#b2593a"
typography:
  display:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "27px"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.045em"
  title:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.032em"
  subtitle:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.028em"
  body:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  body-strong:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  fine:
    fontFamily: "Archivo Variable, Archivo, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: "Azeret Mono Variable, Azeret Mono, ui-monospace, monospace"
    fontSize: "8.5px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.14em"
  label-lg:
    fontFamily: "Azeret Mono Variable, Azeret Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.15em"
  data:
    fontFamily: "Azeret Mono Variable, Azeret Mono, ui-monospace, monospace"
    fontSize: "12.5px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
    fontFeature: "tnum 1"
  numeral-display:
    fontFamily: "Azeret Mono Variable, Azeret Mono, ui-monospace, monospace"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.04em"
    fontFeature: "tnum 1"
rounded:
  none: "0"
  stamp: "3px"
  chip-inner: "5px"
  sm: "8px"
  md: "12px"
  sheet: "20px"
  pill: "99px"
spacing:
  tight: "4px"
  xs: "7px"
  sm: "9px"
  md: "12px"
  pad: "14px"
  gut: "16px"
  lg: "18px"
  xl: "22px"
components:
  coupon:
    backgroundColor: "{colors.rule}"
    rounded: "{rounded.none}"
    padding: "1px"
  coupon-paper:
    backgroundColor: "{colors.coupon}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  coupon-child:
    backgroundColor: "{colors.carbon}"
    rounded: "{rounded.none}"
    padding: "1px"
  coupon-urgent:
    backgroundColor: "{colors.void}"
    rounded: "{rounded.none}"
    padding: "1px"
  coupon-spent:
    backgroundColor: "{colors.rule-soft}"
    rounded: "{rounded.none}"
    padding: "1px"
  stamp-accepted:
    backgroundColor: "{colors.go-wash}"
    textColor: "{colors.go}"
    typography: "{typography.label}"
    rounded: "{rounded.stamp}"
    padding: "4px 7px 3px"
  stamp-waiting:
    backgroundColor: "{colors.gold-wash}"
    textColor: "{colors.gold-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.stamp}"
    padding: "4px 7px 3px"
  stamp-declined:
    backgroundColor: "{colors.void-wash}"
    textColor: "{colors.void-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.stamp}"
    padding: "4px 7px 3px"
  stamp-unclaimed:
    textColor: "{colors.ink-3}"
    typography: "{typography.label}"
    rounded: "{rounded.stamp}"
    padding: "4px 7px 3px"
  stamp-handled:
    backgroundColor: "{colors.spent-wash}"
    textColor: "{colors.spent}"
    typography: "{typography.label}"
    rounded: "{rounded.stamp}"
    padding: "4px 7px 3px"
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.coupon}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.navy-soft}"
    textColor: "{colors.coupon}"
  button-secondary:
    backgroundColor: "{colors.coupon}"
    textColor: "{colors.navy}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "44px"
  button-void:
    backgroundColor: "{colors.void-wash}"
    textColor: "{colors.void-ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "44px"
  button-quiet:
    textColor: "{colors.ink-2}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "38px"
  input:
    backgroundColor: "{colors.coupon}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
    height: "44px"
  chip:
    backgroundColor: "{colors.coupon}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 12px 0 8px"
    height: "42px"
  chip-selected:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.coupon}"
    rounded: "{rounded.sm}"
  pill:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "34px"
  pill-selected:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.coupon}"
    rounded: "{rounded.pill}"
  band-gold:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "9px 0"
  band-void:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "9px 0"
  tabbar:
    backgroundColor: "{colors.navy}"
    height: "78px"
  tab:
    textColor: "#80a0b6"
    typography: "{typography.label}"
  tab-active:
    textColor: "{colors.gold}"
  listrow:
    backgroundColor: "{colors.coupon}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 14px"
  stub:
    backgroundColor: "{colors.coupon-dim}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.sm}"
    padding: "12px 14px"
  notice-unread:
    backgroundColor: "#fffdf8"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 14px"
  sheet:
    backgroundColor: "{colors.stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    width: "100%"
  toast:
    backgroundColor: "{colors.navy-deep}"
    textColor: "#eaf1f6"
    rounded: "9px"
    padding: "11px 13px"
---

# Design System: Daylight — Family OS

## Overview

**Creative North Star: "The Coupon Book"**

A family obligation is a coupon in a jet-age airline ticket wallet. Nothing in this world is a same-size rounded card with a small coloured pill for status; every obligation is a notched, hairline-ruled ticket that carries its own printed record of who, when, where, and what has been stamped on it so far. When a state changes, the coupon is **stamped** — the word lands on the paper with a broken, ink-starved impression and stays there. Nothing disappears; it cancels.

The material is coupon stock (`#f4f1e9`) under white ticket bodies, structured entirely by one-pixel hairlines. Carrier navy owns the three fixed chrome surfaces — the header rail, the primary button, the five-tab bar — and Daylight gold is the single accent, reserved for waiting and for the current tab. Density is high and deliberately clerical: 8.5–10px mono tab-caps field names over 12.5–18px sans values, a 16px gutter, 12px between coupons. The whole system is printed rather than rendered: no gradient, no glass, no blur anywhere inside the product shell, and no raster assets of any kind ship in this build — every mark is CSS, inline SVG path data, or an SVG filter, so there is no image provenance to record.

The build's one piece of real material trickery is the stamp's ink. A single SVG filter (`#ink-impression`) runs fractal-noise turbulence through a colour-matrix threshold, composites it `out` of the source to starve the ink, then displaces the result so the edges break. It is applied to every stamp and to nothing else, and it degrades to no filter where `filter: url()` is unsupported.

**Key Characteristics:**
- Notched ticket silhouettes, cut on an 8-vertex polygon, never a rounded card
- Hairlines carry all structure; shadow is a 3px/9px drop at rest and nothing more
- State is a stamped word with its own border weight and style, legible in greyscale
- One grotesk, one mono; the mono owns every number, code, time and field name
- Navy chrome, gold as the only accent, coupon stock as the only ground

## Colors

Carrier navy and Daylight gold printed on warm coupon stock: a palette of inks on paper, where washes exist only to back a stamp or a flag.

### Primary
- **Carrier Navy** (`{colors.navy}`): The chrome. Owns the header rail, the primary button, the tab bar, the weekday number chip, the selected chip and pill, and the focus ring. It is also every field value's colour inside a coupon — data is set in navy, prose in ink.
- **Rail Navy** (`{colors.navy-deep}`): Toasts and the deepest end of the device frame; the only navy darker than the chrome.
- **Rail Navy Light** (`{colors.navy-soft}`): The primary button's hover state. The only lift the primary button gets.

### Secondary
- **Daylight Gold** (`{colors.gold}`): The one accent. Waiting stamps, the current tab and its 26px underline, the rail's wordmark dash, the unread-notice edge, the rail's own tear perforation, and text selection. It never fills a surface larger than a badge.
- **Gold Ink** (`{colors.gold-ink}`) / **Gold Wash** (`{colors.gold-wash}`): The legible pair for waiting — gold itself is too light to set type in, so the stamp's word is gold ink on gold wash inside a gold border.

### Tertiary
- **Void Red** (`{colors.void}`) with **Void Ink** (`{colors.void-ink}`) and **Void Wash** (`{colors.void-wash}`): Declined and overdue only. Carries the urgent coupon edge, the declined stamp, the flagged list row, the destructive button and the quoted decline reason.
- **Accepted Green** (`{colors.go}`) with **Go Wash** (`{colors.go-wash}`): Accepted stamps, the checked checklist box, the on switch.
- **Carbon Purple** (`{colors.carbon}`) with **Carbon Wash** (`{colors.carbon-wash}`): Everything a child touches. Carries the child coupon's edge and the carbon field tone.
- **Spent Grey** (`{colors.spent}`) with **Spent Wash** (`{colors.spent-wash}`): The handled stamp. The only state colour with no hue commitment, because handled work is finished work.

### Neutral
- **Coupon Stock** (`{colors.stock}`): The app ground under every screen, and the fill of the perforation's punched holes.
- **Sunk Stock** (`{colors.stock-sunk}`): Circular icon marks — the empty-state mark, the notice icon, the helper mark.
- **Board** (`{colors.board}`): The desk the device frame sits on. Outside the product.
- **Coupon White** (`{colors.coupon}`) / **Dimmed Coupon** (`{colors.coupon-dim}`): Ticket paper, and the spent ticket's paper.
- **Handled Ground** (`{colors.handled-ground}`): The Handled screen's full-width tinted ground.
- **Ink** (`{colors.ink}`), **Ink Two** (`{colors.ink-2}`), **Ink Three** (`{colors.ink-3}`): Primary prose, secondary prose, and tertiary labels. All three are blue-cast, derived from the navy foreground rather than stepped toward neutral grey.
- **Rule** (`{colors.rule}`) / **Soft Rule** (`{colors.rule-soft}`) / **Navy Rule** (`{colors.rule-navy}`): Section hairlines and the default coupon edge; interior field dividers; the one hairline above the navy tab bar.
- **Terracotta** (`{colors.terracotta}`): A person identity tint only. Avatars are filled from a fixed per-person set — navy, accepted green, carbon purple, terracotta — and terracotta appears nowhere else in the system.

### Named Rules

**The Greyscale Survival Rule.** No state is carried by colour alone. The **word** is the load-bearing signal — UNCLAIMED / WAITING / ACCEPTED / DECLINED / HANDLED — and the border treatment is corroboration, not substitute: a 2px solid border for the three live states, a dashed border for UNCLAIMED, a flat grey border and no inner ring for HANDLED. Lean on the word, because the borders themselves are hairline-faint (the UNCLAIMED dash sits at 2.2:1 on paper). Audit test: screenshot the screen in greyscale; if you cannot name every item's state from its text alone, the state is under-specified.

**The Region-Scale Colour Rule.** When colour commits, it commits across a whole region, not as scattered dots. The Handled screen takes its tinted ground across its full width and all the way to the tab bar; it does not sprinkle accent marks on stock.

**The Derived Ink Rule.** Secondary and tertiary ink are derived from the navy foreground, never toward neutral grey, and the ink set is verified as a *matrix* — every ink against every ground, not only the pairs that happen to exist today. All of them clear 4.5:1. Ink Three is the weakest and sets the floor: 6.03:1 on coupon white, 5.35:1 on stock, 5.11:1 on spent wash, and 4.70:1 on the Handled tinted ground, its tightest pair and the reason the token sits at its current value. When adding an ink or a ground, re-run the whole matrix rather than the one pair in front of you. One text value sits outside the ink system and outside AA: the input placeholder (`#9aa3a9`, 2.57:1 on coupon white). It is not a licensed text colour and must not be copied onto new surfaces.

**The Side-Tab Prohibition.** Tone is carried by recolouring the coupon's edge and paper, never by adding a coloured accent bar down one side. Side-tab accents were removed from this build deliberately and are not available to new surfaces.

## Typography

**Display Font:** Archivo Variable (with Archivo, `system-ui`, sans-serif)
**Body Font:** Archivo Variable — the same grotesk, all the way down
**Label/Mono Font:** Azeret Mono Variable (with Azeret Mono, `ui-monospace`, monospace)

Both faces are self-hosted variable fonts loaded from `@fontsource-variable`; no system display face and no webfont CDN. The pairing is a transport-timetable voice: a tightly tracked grotesk for anything a person says, and a wide-tracked mono for anything a machine measured.

**Character:** Archivo set at negative tracking (-0.045em on the rail headline down to -0.012em on buttons) reads condensed and spoken. Azeret Mono set in caps at +0.1 to +0.16em reads printed and official. The tension between those two tracking directions is the type system.

### Hierarchy
- **Display** (700, 27px, 1.08, -0.045em): The rail headline naming the day. One per screen.
- **Headline** (700, 22px, 1.08, -0.045em): The rail headline on secondary screens (detail, inbox, settings).
- **Title** (600, 18px, 1.2, -0.032em, `text-wrap: balance`): The coupon's own title. The largest type that ever sits on paper.
- **Subtitle** (600, 15–16px, -0.028em): Weekday heads, sheet heads, empty-state heads.
- **Body** (400, 13px, 1.45): Coupon notes, rail lede, empty-state copy. The rail lede is capped at 32ch; empty-state copy at 30ch.
- **Body Strong** (600, 14px, -0.02em): Buttons, list-row titles, switch-row titles.
- **Fine** (400, 11.5–12px, 1.4–1.5): Field hints, settings notes, secondary person lines.
- **Label** (mono, 700, 8.5–9px, +0.13 to +0.14em, uppercase): Field names, band tags, perforation labels, detail-row labels. The smallest type in the system and always mono caps.
- **Label Large** (mono, 700, 10px, +0.15em, uppercase): Section-rule heads.
- **Data** (mono, 700, 12.5px, -0.02em, tabular): Field values, codes, times.
- **Numeral Display** (mono, 700, 30px, -0.04em, tabular): The handled count. The only large mono in the system.

### Named Rules

**The Measured-In-Mono Rule.** Azeret Mono is reserved for what was counted or named by the system: numerals, item codes, times, durations, counts, and field names. It never sets a sentence a person would speak. Every mono numeral carries tabular figures (`font-variant-numeric: tabular-nums`, `"tnum" 1`) so columns of data line up — unlined numerals are not data.

**The Two-Face Rule.** Two families, no third. If a surface seems to need a display face, it needs Archivo at 27px and -0.045em instead.

## Layout

A single 390×844 phone shell (`--shell-w: 390px`), vertically stacked: a fixed navy rail, one scrolling column, and a fixed 78px tab bar. Screens reserve `78px + 18px` of bottom padding so content clears the bar.

The gutter is 16px (`--gut`) and governs everything that touches the screen edge: section rules, the coupon stack, bands, toasts, the sheet's interior. Coupons are 1px edge plus interior padding of 14px horizontally and 9–14px vertically; the coupon stack is 12px apart, row stacks 7px. Section rules get 22px of top air and 10px below. Field grids are an equal-column CSS grid sized by the number of fields (`--cols`), with 12px cell padding and hairline dividers between them, never gaps.

The rail is 54px of top padding (safe area) with 18px below, closing on a 2px dashed gold tear edge drawn as a repeating background — the coupon book's own perforation, not a border.

Responsive behaviour exists only to get the device frame out of the way. Above 1180px the desk, the device and the two demo panels sit in a three-column grid; at 1180px they collapse to one centred column capped at 420px; at 460px the frame, its padding, its shadow and its radii all go away and the shell becomes the full viewport at `100dvh`. The product itself has no breakpoints: it is a phone surface at every width.

Every interactive target is at least 44px tall — buttons, inputs, checklist rows, the leg button variant — with 38–42px allowed only for quiet inline actions and chips inside a sheet.

## Elevation & Depth

This system is printed, not lifted. Depth comes from hairlines, tonal paper steps (stock → dimmed coupon → coupon white), and inset 1px rings — not from stacked shadows. Inside the product only four surfaces cast anything: the coupon's resting drop-shadow, the coupon's hover drop-shadow, the primary button's 1px seat, and the two surfaces that genuinely float above the shell (the sheet and the toast). Everything else that looks like a border is an `inset box-shadow` ring, so hover can tighten a ring to navy without reflowing a single pixel.

### Shadow Vocabulary
- **Coupon at rest** (`filter: drop-shadow(0 3px 9px rgba(16, 43, 66, 0.07))`): The ticket lying on the stock. Applied as a filter rather than `box-shadow` so it follows the notched clip path.
- **Coupon hovered** (`filter: drop-shadow(0 6px 16px rgba(16, 43, 66, 0.12))`): The only hover elevation in the product, triggered from the coupon's full-bleed hit layer.
- **Primary seat** (`box-shadow: 0 1px 2px rgba(16, 43, 66, 0.3)`): The navy button's single press-ready millimetre.
- **Floating** (`--lift-high: 0 14px 38px rgba(16, 43, 66, 0.17), 0 2px 6px rgba(16, 43, 66, 0.08)`): Sheets and toasts, the only two things that leave the page.
- **Inset ring** (`box-shadow: inset 0 0 0 1px <colour>`): The universal border. 1px at rest, 1px navy on hover, 2px navy on input focus.

### Named Rules

**The Offset-Plus-Blur Rule.** Every shadow in this system has vertical offset and blur and no spread — light comes from above and shadow is never a halo. A spread-only glow around an element is not available.

**The Flat Spent Rule.** A spent coupon drops its shadow entirely (`filter: none`) and steps its paper down a tone. Finished work lies flat on the stock.

## Shapes

The coupon is the system's one signature silhouette and it is built from two clipped layers, not a border. `.coupon` paints the edge colour and clips itself to an eight-vertex polygon with a 14px corner cut (`--cut`); `.coupon__paper` sits one hairline inside it, clipped to its own slightly smaller polygon. That two-layer construction is what lets the printed hairline follow the diagonal cuts — an inset ring on a clipped element cannot do it. Tone variants (`plain` / `spent` / `child` / `urgent`) only recolour `--edge` and `--paper`; focus thickens the edge layer from 1px to 2px navy.

Everything else is rectangular with restrained radii: 8px on buttons, inputs, chips, list rows, stubs and notices; 12px on grouped containers and the empty state; 3px on the stamp; 5px on a checklist box; 99px pill radius only for badges, pills, the switch and the sheet grip. The sheet rises with 20px top corners and square bottoms. Nothing in the product is a circle except avatars, small icon marks, and the perforation's punched holes.

The perforation is the second signature form: a dashed 1px rule bitten at both ends by 16px circular holes that are filled with the stock colour and ringed in the coupon's own `--edge`, so the ticket reads as genuinely punched through to the ground beneath.

## Components

### Buttons
- **Shape:** Softly squared (8px radius), 44px minimum height, 14px horizontal padding, 14px/600 label with a 17px inline icon.
- **Primary:** Navy fill, white label, a 1px navy seat shadow. Hovers to Rail Navy Light; presses 1px down (`translateY(1px)`).
- **Secondary (the default variant):** Coupon-white fill, navy label, 1px warm inset ring (`#cbc5b7`) that tightens to navy on hover.
- **Void:** Void wash fill, void ink label, warm-red inset ring tightening to void red. For destructive and decline actions only.
- **Quiet:** Transparent, Ink Two label, 38px tall, 8px padding. Hovers to a 6% navy wash.
- **Disabled / loading:** 0.45 opacity and `not-allowed`; loading dims only the label to 0.6 and sets `aria-busy`.
- **Leg:** The compact in-row variant — still 44px tall, 12px padding, 13px label.

### Chips and Pills
- **Chip:** Coupon-white, 42px tall, 8px radius, 1px warm inset ring, 13.5px/500 label, often with a 26px avatar. Selected (`aria-pressed="true"`) inverts to navy with a white label and rings the avatar in 60% white. The wide stacked variant is 52px tall and left-aligned with a two-line name block.
- **Pill:** The filter row — transparent, 34px tall, pill radius, warm inset ring, Ink Two label with a mono count at 0.75 opacity. Selected inverts to navy. The row scrolls horizontally with its scrollbar hidden.

### Coupons (the primary container)
- **Corner Style:** 14px notched cut on all four corners, zero radius. See Shapes for the two-layer construction.
- **Background:** Coupon white paper on a `--rule` edge; spent, child and urgent recolour both layers.
- **Shadow Strategy:** Resting 3px/9px drop-shadow, 6px/16px on hover, none when spent. See Elevation & Depth.
- **Border:** The 1px edge layer itself; interior structure is `--rule-soft` hairlines under the head, around the field grid, and between field cells.
- **Internal Padding:** 11–14px head, 13px title, 9–12px field cells, 13–14px action footer.
- **Head:** A mono tab-caps classification line (kind · relative day) at the left and the item's mono code at the right, over a soft hairline. The component names this slot `classification`, and that is the whole of its licence: it prints data the system already holds — kind and day — and is never an editorial line written for the surface.
- **Fields:** An equal-column `dl` of mono tab-caps names over navy tabular values, tone-shiftable per cell to void, gold, carbon or muted.
- **Hit behaviour:** A tappable coupon takes a full-bleed transparent hit layer above the paper; the paper's children are `pointer-events: none` and interactive descendants opt back in. Focus moves the ring onto the edge layer in navy, not onto an outline.

### Inputs / Fields
- **Style:** Coupon-white, 8px radius, 1px warm inset ring, 44px minimum height, 14.5px text, 10×12px padding. Labels sit above in 9px mono tab-caps; hints below in 11.5px Ink Three. Textareas are 84px minimum and vertically resizable; selects suppress the native arrow and draw a 5px chevron from two linear-gradient triangles.
- **Focus:** The inset ring doubles to 2px navy and the native outline is suppressed — no glow, no size change.
- **Placeholder:** `#9aa3a9` — 2.57:1 on coupon white, below AA. Carried by the build; not a value to reuse as text.

### Navigation
- **Rail:** Navy, 54px safe top, holding the wordmark (15px/800, -0.045em, gold accent dash), icon tools at 38px, the day headline, a 13px lede capped at 32ch with gold emphasis, and a 10px mono meta row. Closes on the gold dashed tear edge.
- **Tab bar:** Fixed, 78px tall, navy, five equal columns with 16px of bottom padding and a single `--rule-navy` hairline on top. Tabs are a 20px icon over a 10px/600 label in `#80a0b6`, hovering to `#c7dbe8`. The current tab (`aria-current="page"`) goes gold with a 26px × 2px gold mark at the top edge. Counts ride as void-red mono badges ringed 1.5px in navy.

### Flags (the Alert pattern)
- **Style:** A ruled band on the stock, never a container. Hairlines above and below, no background, no radius, 16px side margins, 9px vertical padding; a mono 8.5px tab-caps tag in the state's own ink-on-wash with a 1px ring, then the message at 12.5px, then an optional 26px chevron action. Consecutive bands drop the second's top border so they share one rule.
- **Tones:** gold (waiting, attention) and void (declined, overdue, conflict).

### Signature Component: The Stamp
The system's memorable move. A state change stamps itself onto the coupon.

- **Form:** Inline mono caps, 700 weight, +0.14em tracking, 2px `currentColor` border, 3px radius, 4×7px padding, rotated -7deg by default (`--tilt`, overridable per instance).
- **Words:** UNCLAIMED, WAITING, ACCEPTED, DECLINED, HANDLED. The word is the state; colour is confirmation.
- **Variants:** Accepted (go on go-wash, 25% inner ring), Waiting (gold ink on gold wash, gold border, 50% inner ring), Declined (void ink on void wash, void border, 25% inner ring), Unclaimed (Ink Three on a **dashed** `#b4ad9c` border, transparent, no ring), Handled (spent on spent-wash, flat, no ring). The small size drops to 9px with a 1.5px border and +0.1em.
- **Ink:** `filter: url(#ink-impression)` — fractal-noise turbulence, a colour-matrix threshold, an `out` composite that starves the ink, and a displacement map that breaks the edges. Defined once in the app shell, applied to stamps and nothing else, with a `@supports not` fallback to no filter.
- **Entrance:** `stamp-down` over 200ms — rotated 9deg further out at 1.45 scale and zero opacity, overshooting to 0.97 scale at 55%, settling at rest. It plays on the state change, not on mount decoration.
- **Placement:** Inline at the end of a leg row, or absolutely at the coupon's top-right corner (`.stamp--corner`), which reserves 104px of title padding so the headline never runs under the impression.

### Motion
Three durations and one curve: 140ms (`--fast`) for colour and ring changes, 200ms (`--base`) for stamps, toasts, switches and backdrops, 320ms (`--slow`) for the sheet rising 26px. Easing is always `cubic-bezier(0.22, 0.61, 0.36, 1)`. Under `prefers-reduced-motion: reduce` all three collapse to 1ms at the token level, so every animation in the system is disabled at once.

**The State-Only Motion Rule.** Motion reports a state change — a stamp landing, a sheet arriving, a ring tightening. Nothing moves to decorate, nothing loops, and nothing animates on scroll.

## Do's and Don'ts

### Do:
- **Do** build every obligation surface as a notched coupon: two clipped layers, 14px cut, edge colour on the outer and paper on the inner.
- **Do** carry state with a stamped word plus its own border weight and style, so the screen survives greyscale.
- **Do** set every number, code, time, count and field name in Azeret Mono with tabular figures, and everything a person would say in Archivo.
- **Do** use the 16px gutter and a 12px coupon stack; set field dividers as hairlines, never as gaps.
- **Do** draw borders as 1px inset rings and tighten them to navy on hover or 2px navy on focus, so nothing reflows.
- **Do** keep gold to waiting, the current tab and the single accent mark; keep void red to declined and overdue.
- **Do** commit colour at region scale — a whole tinted ground, like the Handled screen — rather than scattering accent dots.
- **Do** put the primary action inside the coupon it belongs to.
- **Do** re-run the whole ink-by-ground contrast matrix when adding an ink or a ground; the tightest pair in the build is Ink Three on the Handled tinted ground at 4.70:1.
- **Do** draw every icon from the one 24-box stroked SVG set at 1.6px weight.

### Don't:
- **Don't** add a coloured accent bar down a coupon's side. Tone is carried by `--edge` and `--paper`; side tabs were removed from this build deliberately.
- **Don't** render a flag as a rounded alert card. A flag is a ruled band on the stock with a tab-caps tag.
- **Don't** introduce a gradient, a glass blur, or a backdrop-filter inside the product shell. The three that exist (the desk texture, the device body, the demo panel) are all outside the phone.
- **Don't** use a shadow with spread and no offset. Every shadow is offset plus blur.
- **Don't** add a third type family, a system display face, or an emoji or glyph icon in place of the drawn SVG set.
- **Don't** introduce a kicker or eyebrow above a heading. No kicker pattern is licensed by this system; the coupon head's classification line is the kind and day the system already holds, not a label invented for a surface.
- **Don't** put the primary action in a floating button over the content.
- **Don't** let a status be carried by a small coloured pill alone, and don't let an item quietly leave the plan — it gets stamped HANDLED and moves to the log.
- **Don't** animate anything that is not reporting a state change, and don't bypass the three duration tokens.
- **Don't** ship a raster asset into this system. No image file exists in this build; every mark is CSS, inline SVG path data, or the ink filter.
