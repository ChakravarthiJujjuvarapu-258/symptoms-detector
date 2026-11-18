# AI Symptoms Detector

A responsive health-information app that offers educational symptom assessments, visual symptom information, health-topic chat, and nearby healthcare listings. Assessment results are suggestions for discussion with a qualified healthcare professional—not a diagnosis.

> **Important:** This app is for educational and informational purposes only. It cannot diagnose medical conditions. Always talk to a qualified doctor or healthcare provider for a proper diagnosis and treatment. If your symptoms are severe, getting worse, or feel like an emergency, seek medical help right away.

**Live website:** https://symptoms-detector.lovable.app

---

## What This App Can Do

### 1. Symptom Checker
- Answer a step-by-step assessment covering age, gender, medical history, symptoms, duration, pain, temperature, and other health context.
- AI may suggest possible explanations; a local rule-based assessment is used if the AI service is unavailable.
- It also shows:
  - How likely each condition might be (Low, Moderate, or High match).
  - Symptoms that support and do not support each suggestion.
  - Urgency level and any warning signs that need quick medical attention.
  - A risk badge and a visual health score.
  - Suggested medical tests, general care tips, and the right type of doctor to visit.
  - A suggested care specialty and a shortcut to matching nearby providers and their map.
  - Follow-up questions to discuss with a qualified clinician.
  - Trusted medical references from MedlinePlus.

### 2. Symptom Image Analysis
- Upload a clear JPG, PNG, or WebP photo (up to 8 MB) of a visible symptom, such as a skin rash, swelling, or redness.
- You can drag and drop the image or use the file picker.
- Preview, remove, or replace the image before analyzing it.
- The AI looks for visible features like redness, swelling, spots, scaling, or texture changes.
- It suggests possible conditions with Low, Moderate, or High match ranges.
- It shows educational medical reference images with clear labels that they are not a diagnosis.
- If the image is blurry or unclear, the app asks you to upload a better photo.

### 3. AI Health Chat Assistant
- A floating health-information assistant answers general health questions.
- It gives educational answers and may show MedlinePlus references; if its AI service is unavailable, it can use a small set of local answers.
- It follows strict safety rules: it does not diagnose, does not prescribe medicine, and tells you to see a doctor when needed.

### 4. Assessment Follow-up
- The "Discuss With a Doctor" panel opens an AI consultation chat that can review your assessment report and answer educational questions.
- The AI is not a doctor and cannot diagnose or replace a licensed clinician.
- Copy the assessment summary, download it as a PDF, email it, or open Nearby Care.

### 5. Nearby Healthcare Finder
- Open Nearby Care from an assessment result to see suggested specialties and a matching provider search. Matching uses the reported symptoms, possible explanations, and urgency as guidance—not as a confirmed diagnosis.
- Find hospitals, clinics, pharmacies, and other healthcare providers near your current location or a searched area.
- When Maps is available, the interactive map marks your location and matching providers; selecting a map marker highlights its listing, and selecting a provider recenters the map.
- Compare available provider details such as distance, rating, and reported opening status, then use available call or directions links.
- Allow location access for GPS-based results, or enter a city, area, or postal code instead. Search radius and provider filters can be adjusted.
- Provider search and map display require Google Maps Platform to be configured for an authorized site. Provider details, emergency services, hours, and appointment availability are not guaranteed; confirm them directly. For urgent symptoms, do not wait for search results.

### 6. History and Reports
- Saves up to 100 past symptom assessments in this browser's local storage on this device.
- Search saved summaries, export a report as PDF, or delete an assessment. History does not sync between devices.

### 7. User Login
- Sign in with email and password, Google, or a one-time code sent to a mobile phone.
- The app asks you to log in before you can use the main features.
- Email account creation may require email confirmation. Mobile codes expire and have a resend wait period.

---

## Technologies Used

- **Frontend framework:** TanStack Start with React 19
- **Build tool:** Vite 8
- **Styling:** Tailwind CSS v4 with a clean medical design system
- **UI components:** shadcn/ui
- **Charts and visuals:** recharts
- **Icons:** Lucide React
- **Backend and authentication:** Lovable Cloud
- **AI engine:** Lovable AI Gateway with secure server-side calls
- **Medical references:** MedlinePlus Health Topics API
- **Programming language:** JavaScript (JSX) with some TypeScript files required by the framework

---

## Folder Structure

```
src/
  components/        # Reusable parts of the user interface
  hooks/             # Custom logic for login, mobile view, and theme
  integrations/      # Lovable Cloud connection and auth setup
  lib/               # Helper functions and health-related logic
    health/            # Assessment, AI, image, chat, care matching, and reports
  routes/            # File-based app pages and API handlers
    api/               # Image-analysis API route
    assessment.jsx     # Symptom assessment and results
    auth.jsx           # Sign-in and account creation
    history.jsx        # Locally saved assessments
    image-analysis.jsx # Symptom photo analysis
    nearby.jsx         # Nearby healthcare search and map
    index.jsx          # Home page
  styles.css         # Global design tokens and Tailwind setup
```

---

## How to Run the Project Locally

### What you need
- Node.js and npm
- Access to this project's Lovable Cloud configuration for sign-in and AI features

### Step 1: Install dependencies

```sh
npm ci
```

### Step 2: Start the development server

```sh
npm run dev
```

Open your browser and go to `http://localhost:8080`.

### Step 3: Build for production

```sh
npm run build
```

---

## Service Setup

Lovable Cloud supplies the authentication, backend, and AI configuration. Nearby Care also requires a Google Maps Platform connection for provider search and map display. Configure services through Lovable; do not paste private credentials into app code or commit them.

Google Maps works only on authorized site addresses. Its map or provider search may be unavailable on a local or custom domain that is not authorized. Provider direction links may still be available if the map cannot load.

---

## Safety and Ethics

- The app never gives a final diagnosis.
- All results are shown as possible conditions with uncertainty.
- Emergency symptoms trigger a clear red warning to seek immediate care.
- The app does not recommend prescription medicines or dosages.
- Users are always encouraged to consult a real healthcare professional.
- Assessment history is saved only in the current browser's local storage; it does not automatically sync between devices.
- Uploaded symptom images are used for analysis and are not included in the locally saved assessment history. Avoid uploading identifying or sensitive images.

---

## Deployment and GitHub Sync

This project is built and deployed through [Lovable](https://lovable.dev). When you make changes in the Lovable editor, they can be pushed to a connected GitHub repository, and the live website updates automatically.

To connect GitHub:
1. Open the Lovable editor.
2. Click **+ → GitHub → Connect project**.
3. Authorize GitHub and choose your personal account or organization.
4. Click **Create Repository**.

After that, your project will stay in sync with GitHub.

---

## License

No license file is currently included in this repository. Contact the project owner for reuse or distribution permissions.

---

Built with [Lovable](https://lovable.dev).
