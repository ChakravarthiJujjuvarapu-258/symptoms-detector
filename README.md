# Health Insight AI

Build a modern, responsive web application called "AI Symptoms Detector".

Objective:

Create an AI-powered symptom checker that allows users to enter their symptoms in natural language and receive possible health insights, risk levels, and recommendations. The application should clearly state that it is NOT a replacement for professional medical advice.

Design:

- Modern medical theme

- Blue, white, and teal color palette

- Clean dashboard layout

- Rounded cards

- Responsive for mobile, tablet, and desktop

- Smooth animations

- Dark mode support

Landing Page:

- Hero section with title:

  "AI Symptoms Detector"

- Subtitle:

  "Describe your symptoms and receive AI-powered health insights."

- CTA button:

  "Start Assessment"

Main Assessment Interface:

Step 1:

Collect:

- Age

- Gender

- Height

- Weight

Step 2:

Medical History

Checkboxes:

- Diabetes

- Hypertension

- Heart Disease

- Asthma

- Cancer

- Kidney Disease

- Liver Disease

- Pregnancy

- Allergies

- None

Step 3:

Symptoms Input

Large textarea:

Placeholder:

"Example: I have had a fever for 3 days with sore throat, headache, cough, and fatigue."

Allow users to:

- Type naturally

- Add multiple symptoms

- Mention duration

- Mention severity

Step 4:

Additional Questions

Dropdown:

Duration

- Less than 24 hours

- 1–3 days

- 4–7 days

- More than a week

Pain Scale

Slider 1–10

Temperature

Optional input

Recent travel?

Yes / No

Recent contact with sick person?

Yes / No

Smoker?

Yes / No

Alcohol use?

Yes / No

Analyze Button

When clicked:

Show loading animation:

"AI is analyzing your symptoms..."

Simulate AI thinking.

Results Dashboard

Display cards:

Possible Conditions

Show 3–5 possible conditions.

Each includes:

- Confidence %

- Brief explanation

- Common symptoms

- Typical treatment overview

Risk Level

Colored badge:

Green

Low

Yellow

Moderate

Orange

High

Red

Emergency

Recommendations

Hydration

Rest

Monitor symptoms

Book doctor appointment

Visit urgent care

Call emergency services if severe symptoms

Suggested Tests

Example:

- CBC

- COVID Test

- Influenza Test

- Chest X-ray

- Blood Sugar

- ECG

- Urine Analysis

Health Score

Circular progress indicator

0–100

Timeline

Symptoms entered

Analysis completed

Suggested next actions

Emergency Detection

If symptoms include keywords like:

- chest pain

- difficulty breathing

- severe bleeding

- unconscious

- stroke

- seizures

Immediately display a red emergency warning:

"Your symptoms may indicate a medical emergency. Seek immediate medical attention or call your local emergency services."

History Page

Store previous assessments locally.

Each record contains:

- Date

- Symptoms

- Risk level

- Conditions

Allow:

- Search

- Delete

- Export PDF

AI Chat Assistant

Floating chatbot.

Users can ask:

"What does sore throat mean?"

"Can fever and cough indicate flu?"

"What foods help recovery?"

Chat should provide educational information only.

Disclaimer

Always display:

"This application provides informational and educational guidance only. It is not a medical diagnosis and should not replace consultation with a qualified healthcare professional. If you have severe or worsening symptoms, seek medical care immediately."

Technology

Use:

- React

- TypeScript

- Tailwind CSS

- Responsive layout

- Component-based architecture

- Clean code

- Local storage for history

Charts

Use:

- Pie chart for symptom categories

- Risk gauge

- Health score chart

Accessibility

- WCAG compliant

- Keyboard navigation

- Screen reader friendly

- High contrast support

Performance

- Fast loading

- Lazy loading components

- Optimized rendering

Future Ready

Structure code so it can easily integrate with:

- OpenAI API

- Gemini API

- Claude API

- Medical knowledge APIs

- Electronic Health Records (EHR)

Important Safety Rules

- Never claim to provide a definitive diagnosis.

- Present results as possible conditions, not confirmed diseases.

- Always include uncertainty.

- Always recommend professional medical evaluation when appropriate.

- Prioritize safety by escalating emergency symptoms immediately.

- Clearly distinguish educational information from medical advice.

Generate production-quality UI with reusable components, modern animations, and maintainable code.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://symptoms-detector.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4b470c9a-3cc0-4c3f-8775-91ac50e4184e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
