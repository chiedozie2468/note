import {
    initializeApp,
    getApps,
    App,
    getApp,
    cert,
} from "firebase-admin/app"
import type { ServiceAccount } from "firebase-admin"
import {getFirestore} from "firebase-admin/firestore"
import servicekey from "./service_key.json"

let app: App

if (getApps().length === 0) {
    app = initializeApp({
        credential: cert(servicekey as ServiceAccount),
    });
} else {
    app = getApp(); 
}

const adminDb = getFirestore(app)
export {app as adminApp, adminDb}