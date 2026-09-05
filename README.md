# AI Symptoms Detector

A smart, easy-to-use health information web app that helps you understand what might be causing your symptoms. It uses artificial intelligence to analyze symptoms you describe in words, images you upload, and questions you ask in a chat. The app is designed to look and feel like a professional healthcare tool, and it works smoothly on phones, tablets, and computers.

> **Important:** This app is for educational and informational purposes only. It cannot diagnose medical conditions. Always talk to a qualified doctor or healthcare provider for a proper diagnosis and treatment. If your symptoms are severe, getting worse, or feel like an emergency, seek medical help right away.

**Live website:** https://symptoms-detector.lovable.app

---

## What This App Can Do

### 1. Symptom Checker
- Answer simple step-by-step questions about your age, medical history, symptoms, how long they have lasted, pain level, body temperature, and daily habits.
- The app uses AI to look at your answers and suggest possible health conditions that might match.
- It also shows:
  - How likely each condition might be (Low, Moderate, or High match).
  - Symptoms that support and do not support each suggestion.
  - Urgency level and any warning signs that need quick medical attention.
  - A risk badge and a visual health score.
  - Suggested medical tests, general care tips, and the right type of doctor to visit.
  - Follow-up questions the AI would ask a real doctor.
  - Trusted medical references from MedlinePlus.

### 2. Symptom Image Analysis
- Upload a clear photo of a visible symptom, such as a skin rash, swelling, or redness.
- You can drag and drop the image or use the file picker.
- Preview, remove, or replace the image before analyzing it.
- The AI looks for visible features like redness, swelling, spots, scaling, or texture changes.
- It suggests possible conditions with Low, Moderate, or High match ranges.
- It shows educational medical reference images with clear labels that they are not a diagnosis.
- If the image is blurry or unclear, the app asks you to upload a better photo.

### 3. AI Health Chat Assistant
- A friendly floating chatbot answers general health questions.
- It gives educational answers and shows trusted MedlinePlus references.
- It follows strict safety rules: it does not diagnose, does not prescribe medicine, and tells you to see a doctor when needed.

### 4. Talk to a Doctor
- A "Discuss With a Doctor" feature opens a live consultation chat with an AI doctor assistant.
- The AI doctor assistant reviews your generated report, asks focused questions, and guides you toward proper medical care.
- You can copy your report, download it as a PDF, or share it by email.
- The assistant also helps you find nearby hospitals, clinics, and pharmacies.

### 5. Nearby Healthcare Finder
- Find hospitals, clinics, pharmacies, and emergency services near your current location.
- Shows a live map, distance from your location, ratings, open status, and one-tap buttons to call or get directions.
- Uses your device location with high accuracy when you allow it.

### 6. History and Reports
- Saves your past symptom assessments in your browser's local storage.
- You can search, view, delete, or export any past report.

### 7. User Login
- Sign in with email and password, Google account, or mobile phone OTP.
- The app asks you to log in before you can use the main features.
- Mobile OTP includes a resend button and clear messages if the code expires or fails to send.

---

## Technologies Used

- **Frontend framework:** TanStack Start with React 19
- **Build tool:** Vite 7
- **Styling:** Tailwind CSS v4 with a clean medical design system
- **UI components:** shadcn/ui
- **Charts and visuals:** recharts
- **Icons:** Lucide React
- **Backend and authentication:** Lovable Cloud (powered by Supabase)
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
    health/            # AI analysis, chat, doctor consult, image handling, reports
  routes/            # Pages of the app
    api/               # Server-side API endpoints
    assessment.jsx     # Symptom checker page
    auth.jsx           # Login page
    history.jsx        # Past reports page
    image-analysis.jsx # Image analysis page
    nearby.jsx         # Nearby healthcare finder page
    index.jsx          # Home page
  styles.css         # Global colors, fonts, and Tailwind setup
```

---

## How to Run the Project Locally

### What you need
- Node.js (LTS version recommended)
- npm or bun package manager

### Step 1: Install dependencies

```sh
npm install
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

## Environment Variables

These settings are used to connect the app to AI services and the backend. Server-side variables are read only inside secure handlers. Public frontend settings use the `VITE_` prefix.

| Variable | Purpose |
|----------|---------|
| `LOVABLE_API_KEY` | Key for calling the Lovable AI Gateway from the server |
| `VITE_SUPABASE_URL` | Your Lovable Cloud project URL (created automatically) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public key for connecting to Lovable Cloud (created automatically) |

Do not share or commit secret keys. On Lovable Cloud, secrets are managed safely through the Lovable backend settings.

---

## Safety and Ethics

- The app never gives a final diagnosis.
- All results are shown as possible conditions with uncertainty.
- Emergency symptoms trigger a clear red warning to seek immediate care.
- The app does not recommend prescription medicines or dosages.
- Users are always encouraged to consult a real healthcare professional.
- Uploaded images are only used for analysis and are not stored permanently unless the user chooses to save them.

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

This project is created for educational and demonstration purposes. You are free to modify and extend it for your own use.

---

Built with [Lovable](https://lovable.dev).
