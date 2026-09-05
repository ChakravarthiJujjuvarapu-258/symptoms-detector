# AI Symptoms Detector

A modern, AI-powered health information web application that helps users understand possible causes for their symptoms through natural language analysis, image analysis, and educational chat. Built as a responsive, accessibility-first React application with a professional medical design system.

> **Important:** This application provides informational and educational guidance only. It is not a medical diagnosis tool and should never replace consultation with a qualified healthcare professional. If you have severe or worsening symptoms, seek medical care immediately.

**Live app:** https://symptoms-detector.lovable.app

---

## Features

### Symptom Assessment
- Multi-step wizard collecting demographics, medical history, symptom description, duration, pain scale, temperature, and lifestyle factors.
- AI-powered analysis via a secure server-side Lovable AI Gateway (`openai/gpt-5.6-sol`) with a rule-based safety fallback.
- Possible conditions with calibrated confidence ranges, matched/against features, urgency level, and red-flag detection.
- Risk level badge (Low / Moderate / High / Emergency) and animated health score ring.
- Suggested tests, generic over-the-counter guidance, specialist recommendation, and follow-up questions.
- Structured MedlinePlus citations for educational reference.

### Image Analysis
- Upload JPG, JPEG, PNG, or WEBP symptom images via drag-and-drop or file picker.
- Preview, remove, and replace images before analysis.
- Vision-model analysis identifying visible features and possible conditions with Low/Moderate/High match ranges.
- Educational reference images clearly labelled as non-diagnostic.
- Image quality validation with an insufficient-quality fallback.

### AI Health Chat Assistant
- Floating educational chatbot for health questions.
- Context-aware answers with structured MedlinePlus references.
- Strict safety guardrails: no diagnosis, no prescriptions, emergency escalation when needed.

### Doctor Consultation
- "Discuss With a Doctor" live consultation chat powered by a streamed AI consultant persona.
- Generated report with copy, PDF export, email sharing, and nearby care finder integration.

### Nearby Healthcare Finder
- Find nearby hospitals, clinics, pharmacies, and emergency services.
- Live map integration, distance sorting, and one-tap call/directions.

### History & Reports
- Local-storage persistence of past assessments.
- Search, delete, and export individual reports.

### Authentication
- Email/password and Google OAuth sign-in.
- Mobile OTP sign-in with resend cooldown and expiry handling.
- Auth-gated app entry with automatic redirect to login.

---

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React 19, file-based routing, SSR/SSG)
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS v4 with native CSS theme tokens
- **UI Components:** shadcn/ui
- **Charts:** recharts
- **Icons:** Lucide React
- **Backend:** Lovable Cloud (Supabase) — auth, profiles, database
- **AI:** Lovable AI Gateway via secure `createServerFn` server functions
- **Medical References:** MedlinePlus Health Topics API
- **Language:** JavaScript (JSX) with TypeScript for framework-required files

---

## Project Structure

```
src/
  components/        # Reusable UI components (header, chat, disclaimer, assessment, results)
  hooks/             # Custom React hooks (auth, mobile, theme)
  integrations/      # Lovable Cloud / Supabase clients and auth middleware
  lib/               # Utility functions and health domain logic
    health/            # Analysis engine, AI functions, chat, consult, imagery, storage, export
  routes/            # TanStack file-based routes
    api/               # Server API endpoints (image analysis, etc.)
    assessment.jsx
    auth.jsx
    history.jsx
    image-analysis.jsx
    nearby.jsx
    index.jsx
  styles.css         # Global design tokens and Tailwind imports
```

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm or bun

### Install dependencies

```sh
npm install
```

### Run the development server

```sh
npm run dev
```

The app will be available at `http://localhost:8080`.

### Build for production

```sh
npm run build
```

---

## Environment Variables

Server-side variables are read inside handlers only. The frontend uses `import.meta.env.VITE_*` for public config.

| Variable | Purpose |
|----------|---------|
| `LOVABLE_API_KEY` | Lovable AI Gateway key for server-side AI calls |
| `VITE_SUPABASE_URL` | Lovable Cloud project URL (auto-generated) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Lovable Cloud anon/public key (auto-generated) |

Do not commit secrets. On Lovable Cloud, secrets are managed through the Lovable backend UI.

---

## Safety & Ethics

- The app never claims to provide a definitive diagnosis.
- Results are always presented as possible conditions with uncertainty.
- Emergency keywords trigger an immediate red emergency warning.
- Prescription medication and dosage recommendations are not provided.
- Users are always encouraged to consult a qualified healthcare professional.

---

## Deployment

This project is built and deployed through [Lovable](https://lovable.dev). Every change in the Lovable editor is committed to the connected repository, and the published app updates automatically.

To enable GitHub sync, open the Lovable editor and select **+ → GitHub → Connect project**, authorize GitHub, choose your account or organization, and click **Create Repository**.

---

## License

This project is generated for educational and demonstration purposes. The code is yours to modify and extend.

---

Built with [Lovable](https://lovable.dev).
