---
name: Zen Stillness
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#504441'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#827470'
  outline-variant: '#d4c3be'
  surface-tint: '#77574d'
  primary: '#442a22'
  on-primary: '#ffffff'
  primary-container: '#5d4037'
  on-primary-container: '#d4ada1'
  inverse-primary: '#e7bdb1'
  secondary: '#655d5a'
  on-secondary: '#ffffff'
  secondary-container: '#ece0dc'
  on-secondary-container: '#6b6360'
  tertiary: '#21333a'
  on-tertiary: '#ffffff'
  tertiary-container: '#384a51'
  on-tertiary-container: '#a5b9c1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#e7bdb1'
  on-primary-fixed: '#2c160e'
  on-primary-fixed-variant: '#5d4037'
  secondary-fixed: '#ece0dc'
  secondary-fixed-dim: '#cfc4c0'
  on-secondary-fixed: '#201a18'
  on-secondary-fixed-variant: '#4c4542'
  tertiary-fixed: '#d2e6ef'
  tertiary-fixed-dim: '#b6cad2'
  on-tertiary-fixed: '#0b1e24'
  on-tertiary-fixed-variant: '#374951'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.8'
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.1em
  caption:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 24px
  section-gap: 120px
---

## Brand & Style

This design system is anchored in the concept of *Ma* (the space between) and *Thiền* (Zen). It aims to create a digital sanctuary for the "Từ Tâm Phục" brand—a space that feels as breathable and high-quality as the linen and silk garments it showcases. The aesthetic direction is **Zen Minimalism** infused with **Glassmorphism**, mimicking the interplay of light through paper shoji screens or morning mist at a Vietnamese temple.

The UI avoids all "commercial noise." There are no aggressive sales banners or frantic countdown timers. Instead, the design evokes a sense of permanence, mindfulness, and quiet luxury. It targets a discerning audience seeking spiritual connection and sartorial elegance, demanding an interface that respects their attention through generous whitespace and intentional motion.

## Colors

The palette is derived from natural elements found in monastic environments: polished wood, sun-bleached sand, and weathered stone.

- **Primary (Wood Brown):** Used for typography and high-importance interaction points. It provides the grounding "earth" element.
- **Secondary (Sand):** Used for subtle backgrounds and dividing sections without the harshness of lines.
- **Neutral (Ivory):** The primary canvas color. It is warmer than pure white, reducing eye strain and feeling more "organic."
- **Tertiary (Soft Indigo):** A cooling breath of air used sparingly for success states, subtle badges, or highlight backgrounds to prevent the palette from feeling too monochromatic.
- **Stone Gray:** Used for metadata and secondary labels to maintain a low-contrast, peaceful hierarchy.

## Typography

Typography follows a "Classical Modernist" approach. **Playfair Display** provides the editorial authority and traditional grace required for a premium Buddhist brand. It should be used for all storytelling elements and product titles.

**Montserrat** acts as the functional counterpart. Its geometric clarity ensures that product details and checkout flows are effortless to navigate. 

Key Rules:
- **Line Height:** Body text uses a generous `1.8` multiplier to enhance readability and the feeling of "spaciousness."
- **Letter Spacing:** Labels and headers use slight tracking adjustments to evoke the feel of high-end boutique branding.
- **Hierarchy:** Use weight sparingly; rely on size and the contrast between Serif and Sans-Serif to guide the eye.

## Layout & Spacing

The layout is a **Fixed Center Grid** on desktop to evoke a sense of stability and balance (symmetry). On mobile, it transitions to a fluid single-column flow with significant top/bottom padding to prevent elements from feeling cramped.

- **The Grid:** A 12-column system with wide 24px gutters.
- **Sectioning:** Unlike typical e-commerce, this design system utilizes "Section Gaps" of 120px. This encourages the user to slow down and appreciate one collection or story at a time.
- **Padding:** Content should never touch the edges of its container. Use a minimum of 40px internal padding for cards and modals to maintain the "Zen" breathability.

## Elevation & Depth

Depth is handled with extreme subtlety to mimic natural light casting soft shadows on fabric.

1.  **Tonal Layering:** The primary method of separation. Use the Sand (#D7CCC8) or Ivory (#F5F5F5) backgrounds to create "islands" of content.
2.  **Glassmorphism:** Reserved specifically for the Navigation Bar and floating Action Buttons. Use a `backdrop-filter: blur(12px)` with a semi-transparent Ivory (#F5F5F5) at 80% opacity. This suggests a "misty" overlay that keeps the user connected to the content beneath.
3.  **Ambient Shadows:** Avoid standard drop shadows. Use "Ambient Occlusion" style shadows—very large blur (32px+), low opacity (4-6%), and tinted with the Primary Wood Brown rather than pure black. This creates a soft glow rather than a heavy lift.

## Shapes

The shape language is **Soft and Organic**. Perfectly sharp corners are avoided as they feel "aggressive," while fully rounded "pill" shapes feel too "tech-startup."

- **Base Radius:** 4px (Soft) for buttons and inputs.
- **Large Radius:** 8px for Product Cards and Modals.
- **Images:** Should feature slightly softened corners to blend into the background.
- **Dividers:** When necessary, use extremely faint 1px lines in Sand (#D7CCC8), but prefer using whitespace as the primary divider.

## Components

### Navigation Bar
A minimalist, fixed top-bar. It uses a glassmorphic Ivory background. Links are in `label-md` Montserrat with a Wood Brown active state indicated by a subtle 1px underline, not a bold change.

### Product Cards
Cards are borderless. The focus is entirely on the photography, which should feature soft, natural lighting. The product name (Playfair) and price (Montserrat) appear below the image. On hover, the image undergoes a subtle 1.02x scale zoom—a slow, meditative transition.

### Buttons
- **Primary:** Outlined Wood Brown (#5D4037) with a 1px stroke. On hover, it fills with a very pale version of the brown.
- **Secondary:** Text-only with an arrow icon, emphasizing the "Premium" feel over "Call to Action" loudness.

### Form Inputs
Minimalist bottom-border only or a very light Sand-colored fill. Focus states use a subtle Wood Brown bottom border transition. Labels should always be visible in `caption` style.

### Footer
A structured, multi-column layout using the Sand (#D7CCC8) background. It contains "Slow-links" like *The Art of Wear*, *Fabric Care*, and *Temple Etiquette*, reinforcing the brand as a lifestyle educator rather than just a store.