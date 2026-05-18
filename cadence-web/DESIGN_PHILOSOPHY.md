# Design Philosophy — Cadence Landing Page

## Movement: "Kinetic Pulse"

Athletic precision meets midnight energy. This landing page embodies the moment before the lift — focused, powerful, inevitable. Dark backgrounds create intimacy and focus; vibrant accents pulse with contained energy, ready to explode into action.

The visual language speaks to coaches who spend their 5am in dim gyms with phone flashlights, who check athlete progress during late-night session prep. We meet them in their environment, not in sterile corporate daylight.

## Palette

| Role | Color | Hex | Emotional Intent |
|------|-------|-----|------------------|
| **Background Primary** | Deep Space | `#0A0A0B` | Depth, focus, professional darkness |
| **Background Secondary** | Charcoal Mist | `#141416` | Subtle elevation, card backgrounds |
| **Accent Primary** | Electric Coral | `#FF6B4A` | Energy, urgency, action (CTA) |
| **Accent Secondary** | Pulse Orange | `#FF8F6B` | Hover states, glow effects |
| **Text Primary** | Pure White | `#FFFFFF` | Headlines, maximum contrast |
| **Text Secondary** | Muted Stone | `#A1A1AA` | Body copy, descriptions |
| **Success** | Vibrant Green | `#22C55E` | Confirmation states |

CSS Variables:
```css
:root {
  --bg-primary: #0A0A0B;
  --bg-secondary: #141416;
  --accent: #FF6B4A;
  --accent-hover: #FF8F6B;
  --text-primary: #FFFFFF;
  --text-muted: #A1A1AA;
  --success: #22C55E;
}
```

## Typography

**Display Font: Plus Jakarta Sans (Bold/ExtraBold)**
- Source: Google Fonts / Fontsource
- Why: Geometric, modern, distinctive without being quirky. High legibility at large sizes with character that Inter lacks. The slightly rounded terminals feel approachable yet professional — perfect for Quebec coaches who want premium but not pretentious.

**Body Font: Plus Jakarta Sans (Regular/Medium)**
- Using one family simplifies loading while maintaining cohesion
- Weight variation creates hierarchy: ExtraBold (headlines) → Bold (subheads) → Regular (body)

Font sizes follow a modular scale (1.25 ratio):
- Hero headline: `clamp(2.5rem, 8vw, 4.5rem)`
- Subheadline: `clamp(1.125rem, 2.5vw, 1.5rem)`
- Body: `1rem (16px)`
- Small/Caption: `0.875rem`

## Spatial Language

**Breathing Room Over Density**
The page exhales. Each section has generous vertical padding (min 80px) that gives content room to breathe. This isn't sparse minimalism — it's confident use of space that says "we don't need to cram features to prove value."

**Asymmetric Balance**
- Hero text aligns left on desktop (reads naturally), centered on mobile (fits the format)
- Value props use a subtle offset grid — not perfectly symmetrical but visually balanced
- The "Conçue au Québec" badge sits asymmetrically, drawing the eye

**Vertical Rhythm**
- Base spacing unit: 8px
- Section gaps: 12rem (96px) minimum
- Component gaps: 2-4rem
- Text line-height: 1.5 (body), 1.1 (headlines)

## Motion Language

**The Orchestrated Entrance**
One coordinated moment when the page loads — this is the memorable motion:

1. Background gradient fades in (0ms, 600ms duration)
2. Headline slides up + fades (100ms delay, 600ms duration)
3. Subheadline slides up + fades (200ms delay, 500ms duration)
4. Form slides up + fades (350ms delay, 500ms duration)
5. Badge pops in with subtle scale (500ms delay, 300ms duration)

Easing: `cubic-bezier(0.16, 1, 0.3, 1)` — quick start, smooth landing (Expo.out feel)

**Subtle Interactions**
- CTA button: slight scale (1.02) + glow spread on hover
- Input field: border color transitions, subtle shadow on focus
- Value prop cards: gentle lift (translateY -4px) + shadow on hover
- Links: underline reveals left-to-right

**What We DON'T Do**
- No parallax scrolling (distracting on mobile)
- No infinite animations (loops are annoying)
- No complex scroll-triggered animations (keep it fast)

## The Unforgettable Thing

**The Glowing Waitlist Counter**

When a user submits their email, they see: "Tu es le **#47e** sur la liste."

This number pulses with a subtle coral glow — like a heartbeat. It's personal ("you're not just signing up, you're joining a specific position"), it's social proof ("others came before you"), and it creates FOMO ("there's a line, and it's growing").

The counter animates up when the success state appears — a small moment of delight that makes the user feel like they just secured something valuable.

**Secondary Memorable Elements:**
- The "🇨🇦 Conçue au Québec, en français" badge — immediately signals localization and pride
- Dark mode default — coaches opening this at 5am in a dim gym won't be blinded
- The headline "repensé pour ici" — "here" carries weight (Quebec, local, us)

---

## Anti-AI-Slop Checklist

Before shipping, verify:
- [ ] No Inter, Roboto, Arial, or system fonts
- [ ] No purple/blue gradients (overused AI aesthetic)
- [ ] No uniform rounded corners everywhere
- [ ] No centered-everything predictable layout
- [ ] No stock photos
- [ ] Background has depth (gradient mesh, noise, or layers)
- [ ] Typography has clear hierarchy with distinctive display font
- [ ] One dominant accent color, not a scattered rainbow
- [ ] Motion is orchestrated, not scattered hover effects
- [ ] Spacing feels crafted, not default Tailwind values

---

*Version: 1.0 | Issue #39 | Sprint 2 | Author: CTO Agent*
