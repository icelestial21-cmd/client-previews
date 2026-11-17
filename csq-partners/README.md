# CSQ Partner Website Templates

Repeatable website templates for the CSQ Partner Programmes (Media API, Travel API, partner websites), built by iCelestial.

| Template | Partner type | CSQ API | Packages (JMD) | 3D element |
| --- | --- | --- | --- | --- |
| `touchline-times/` | Media partners | Media API | Kickoff 35,000 · Prime Time 55,000 · Championship 80,000 | Match ball with broadcast rings |
| `horizon-isles-travel/` | Travel agents | Travel API | Boarding Pass 35,000 · Business Class 55,000 · First Class 80,000 | Globe with flight routes into the Caribbean |
| `arrivee-concierge/` | Concierge providers | Travel API | Welcome 35,000 · Signature 55,000 · VIP Concierge 80,000 | Metallic arrival and VIP passes |

## Make a new partner site

1. Copy the template folder (for example `touchline-times/` to `partner-name/`). Keep `partner-engine/` alongside it (as a sibling folder).
2. Edit `config.js`: name, logo letters, tagline, contact details, colours, display font and `tier` (1, 2 or 3).
3. Replace the sample stories, deals, services and events with the partner's own content.
4. Set `preview: false` to remove the package switcher, preview badge and feedback button.
5. CSQ issues the partner's key in Admin → Data Partners; connect it and use "Send test story" / "Send test listing" to confirm.

## How tiers work

Any element with `data-tier="2"` or `data-tier="3"` only shows on that package or above. The engine reads `tier` from `config.js`. In previews, the switcher at the bottom of the page lets you compare packages.

## Structure

```
partner-engine/engine.css    shared layout, components, forms, tier switcher
partner-engine/engine.js     config → colours/text/links, tier gating, filters, multi-step forms, countdowns, tilt
engine/3d/           Three.js scenes (core helper, football, globe, pass); Three.js is vendored in engine/vendor
<template>/config.js  the only file that changes per partner
<template>/theme.css  the template's look (type, layout, details)
```

All brands, stories, deals, events and prices in the templates are samples. Live airline search (GDS), payment gateways, domains and hosting are not included.

## Link previews

Each page carries Open Graph and Twitter card tags (title, description, 1200×630 image, canonical URL) so shared links show a rich preview. Update these tags with the partner's own name, description, domain and photo when a template becomes a real site.
