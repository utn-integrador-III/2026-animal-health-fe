## Requirements

- Node.js 20+
- Python 3.10+
- Firebase project with Firestore enabled
- Firebase Admin service account JSON

## Configuration

Use [.env.example](.env.example) as the environment variable reference.

The backend refuses to start in production without `SECRET_KEY`. The Firebase credential file must remain outside version control.

Profile photo uploads also require the exact Firebase Storage bucket name:

```env
FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
```

Copy the bucket name shown in the Firebase Console under Storage.

## Frontend

```powershell
npm install
npm run dev
```

Default URL: `http://localhost:5173`

## Verification

```powershell
npm run lint
npm run test
npm run build
```
