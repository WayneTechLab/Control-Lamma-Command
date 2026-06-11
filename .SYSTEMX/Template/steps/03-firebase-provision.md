# Step 03 — Firebase Provision

> Create (or adopt) the Firebase/GCP project, enable the services you need, and
> capture the **web app config** that becomes your `VITE_FIREBASE_*` variables.

## 🎯 Goal
`firebase use` resolves to your project, required services are enabled, and you
hold the seven web-config values for Step 04.

## ✅ Preconditions
- Step 00 (`firebase`, `gcloud` authenticated) and Step 01 complete.
- From `interview.answers`: `FIREBASE_MODE` (`create|existing`), `SLUG`,
  `GCP_REGION`, `AUTH_PROVIDERS`.

## ❓ Operator prompts
1. Create a new project or use an existing one?
2. If existing — what is the **project ID**?
3. Billing account to attach (required for Cloud Functions / Blaze plan)?

## ⌨️ Commands

### Path A — Create a new project (headless)
```bash
PROJECT_ID="${SLUG}"            # must be globally unique; append -app if taken
firebase projects:create "$PROJECT_ID" --display-name "${DISPLAY_NAME}"
firebase use "$PROJECT_ID"

# Register a Web App and print its config (these are your VITE_FIREBASE_* values)
firebase apps:create WEB "${DISPLAY_NAME} Web" --project "$PROJECT_ID"
firebase apps:sdkconfig WEB --project "$PROJECT_ID"
```

### Path B — Use an existing project (created in the console)
```bash
firebase use "${EXISTING_PROJECT_ID}"
firebase apps:list --project "${EXISTING_PROJECT_ID}"
firebase apps:sdkconfig WEB <APP_ID> --project "${EXISTING_PROJECT_ID}"
```

### Capture web config from the console (manual fallback)
Firebase console → **Project settings → General → Your apps → SDK setup &
config → Config**. Copy the object; it maps 1:1 to:
```
apiKey            → VITE_FIREBASE_API_KEY
authDomain        → VITE_FIREBASE_AUTH_DOMAIN
projectId         → VITE_FIREBASE_PROJECT_ID
storageBucket     → VITE_FIREBASE_STORAGE_BUCKET
messagingSenderId → VITE_FIREBASE_MESSAGING_SENDER_ID
appId             → VITE_FIREBASE_APP_ID
measurementId     → VITE_FIREBASE_MEASUREMENT_ID
```

### Capture iOS / Android config (if PLATFORMS includes them)
Register the mobile apps and download their config files, then capture them.
The **project id / number is shared** with the Web app above.

```
# iOS — GoogleService-Info.plist
firebase apps:create IOS "${DISPLAY_NAME} iOS" --bundle-id <your.bundle.id> --project "$PROJECT_ID"
firebase apps:sdkconfig IOS <APP_ID> --project "$PROJECT_ID"   # → GoogleService-Info.plist
#   BUNDLE_ID → IOS_BUNDLE_ID   GOOGLE_APP_ID → IOS_APP_ID   API_KEY → IOS_API_KEY
#   CLIENT_ID/REVERSED_CLIENT_ID → IOS_CLIENT_ID/IOS_REVERSED_CLIENT_ID
#   STORAGE_BUCKET → IOS_STORAGE_BUCKET

# Android — google-services.json
firebase apps:create ANDROID "${DISPLAY_NAME} Android" --package-name <your.package.name> --project "$PROJECT_ID"
firebase apps:sdkconfig ANDROID <APP_ID> --project "$PROJECT_ID"  # → google-services.json
#   android_client_info.package_name → ANDROID_PACKAGE_NAME
#   mobilesdk_app_id → ANDROID_APP_ID   api_key[0].current_key → ANDROID_API_KEY
#   project_info.storage_bucket → ANDROID_STORAGE_BUCKET
```

> Fastest path: run the control menu and paste/auto-import all of the above:
> `bash ../WSG-MENU.sh` → **option 4 (Capture Firebase project info)**. Point it
> at the downloaded `GoogleService-Info.plist` / `google-services.json` and it
> parses the values for you.

### Enable services + initialize local config
```bash
# Upgrade to Blaze (pay-as-you-go) is required for Functions/outbound network.
# Enable the GCP APIs your modules need:
gcloud services enable \
  firestore.googleapis.com \
  firebasestorage.googleapis.com \
  cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com \
  --project "$PROJECT_ID"

# Create Firestore in your region (Native mode):
gcloud firestore databases create --location="${GCP_REGION}" --project "$PROJECT_ID"

# Initialize Firebase config files in the repo:
firebase init firestore hosting storage functions
# - Firestore: accept firestore.rules / firestore.indexes.json
# - Hosting:   public dir = dist, single-page app = Yes, no auto-builds
# - Storage:   accept storage.rules
# - Functions: TypeScript, Node 22
```

### Enable auth providers (console or CLI)
Enable each provider from `AUTH_PROVIDERS` in **Authentication → Sign-in method**.
(Email/Password and Google can be toggled in the console; OAuth providers need
client IDs/secrets.)

## 📄 Generated files
- `.firebaserc`, `firebase.json`
- `firestore.rules`, `firestore.indexes.json`, `storage.rules`
- `functions/` skeleton (fleshed out in Step 06)
- The captured web config → recorded into `interview.answers` for Step 04.

## 🔒 Security notes
- The web `apiKey` is **not a secret**; protect data with Security Rules
  (Step 07) and enable **App Check** before production.
- Restrict the API key in GCP console (HTTP referrers / API restrictions).
- Grant least-privilege IAM; avoid `Owner` on automation service accounts.
- Set a **billing budget + alert** now (Step 12 automates it) to avoid surprises.

## 🚦 Verification gate
```bash
firebase use                        # prints active project
gcloud firestore databases list --project "$PROJECT_ID"
test -f firebase.json && echo "firebase.json present"
```
✅ Pass → proceed to [Step 04 — Env & Secrets](./04-env-and-secrets.md).
