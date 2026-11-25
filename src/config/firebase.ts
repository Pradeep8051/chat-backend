
import "dotenv/config";

import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";

import {
  getFirestore,
  type Firestore,
} from "firebase-admin/firestore";

import { readFileSync } from "node:fs";
import path from "node:path";

let firestoreInstance: Firestore | null = null;

function buildFirebaseApp(): App {
  const existing = getApps();

  if (existing.length > 0) {
    return existing[0];
  }

  const credentialsPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!credentialsPath) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_PATH is missing in .env"
    );
  }

  const absolutePath = path.resolve(
    process.cwd(),
    credentialsPath
  );

  const serviceAccount = JSON.parse(
    readFileSync(absolutePath, "utf8")
  );

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

export function getFirestoreDb(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(buildFirebaseApp());
  }

  return firestoreInstance;
}

export const firestore: Firestore = getFirestoreDb();
