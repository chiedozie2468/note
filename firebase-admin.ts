import {
    initializeApp,
    getApps,
    App,
    getApp,
    cert,
} from "firebase-admin/app"
import type { ServiceAccount } from "firebase-admin"
import {getFirestore} from "firebase-admin/firestore"
import { existsSync, readFileSync } from "fs"
import path from "path"

let app: App

function normalizeServiceAccount(serviceAccount: Record<string, string | undefined>): ServiceAccount {
    return {
        projectId: serviceAccount.projectId ?? serviceAccount.project_id,
        clientEmail: serviceAccount.clientEmail ?? serviceAccount.client_email,
        privateKey: (serviceAccount.privateKey ?? serviceAccount.private_key)?.replace(/\\n/g, "\n"),
    };
}

function getServiceAccount(): ServiceAccount {
    const serviceAccountJson =
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY ??
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (serviceAccountJson) {
        return normalizeServiceAccount(JSON.parse(serviceAccountJson));
    }

    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        return normalizeServiceAccount(
            JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8"))
        );
    }

    if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
    ) {
        return normalizeServiceAccount({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY,
        });
    }

    const serviceKeyPath = path.join(process.cwd(), "service_key.json");

    if (existsSync(serviceKeyPath)) {
        return normalizeServiceAccount(JSON.parse(readFileSync(serviceKeyPath, "utf8")));
    }

    throw new Error(
        "Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_KEY in Vercel, or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
}

if (getApps().length === 0) {
    app = initializeApp({
        credential: cert(getServiceAccount()),
    });
} else {
    app = getApp(); 
}

const adminDb = getFirestore(app)
export {app as adminApp, adminDb}
