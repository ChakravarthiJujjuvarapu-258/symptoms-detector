# Kinetic Elegance redesign for every page

## Goal
Apply the selected premium healthcare direction consistently across the entire signed-in experience and login screen: Obsidian Black, Champagne Gold, Royal Blue, Cormorant Garamond headings, Manrope body text, restrained glass surfaces, and subtle motion.

## What will change
- Establish the complete shared visual system, including light/dark tokens, gold and blue accents, glass surfaces, typography, controls, focus states, and reduced-motion behavior.
- Redesign the overview page into a focused clinical workspace with a stronger primary assessment action and coordinated feature modules.
- Restyle login, assessment, image analysis, results, history, nearby care, doctor consultation, chat, loading, error, and empty states.
- Make the navigation and supporting health panel consistent on desktop, tablet, and mobile without hiding essential destinations.
- Finish the pending manual area search controls on Nearby care while preserving GPS search and existing map behavior.
- Add complete social sharing metadata to every content page.

## Quality checks
- Verify every page at desktop and mobile sizes for readable text, stable spacing, visible controls, and no overlap.
- Exercise key interactions: sign-in view, navigation, assessment flow, image upload view, history search, nearby location controls, chat, and dialogs.
- Confirm the current build is clean and animations respect reduced-motion preferences.

## Technical details
- Keep the current TanStack routing, Lovable Cloud authentication, medical-analysis logic, APIs, and storage behavior unchanged.
- Centralize visual values in semantic tokens and reusable Kinetic classes; page code will use those shared roles rather than hardcoded colors.
- Use the existing design-system controls for all actions and selectors.
