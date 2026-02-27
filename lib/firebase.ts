import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    Firestore,
    Timestamp,
    query,
    orderBy,
} from 'firebase/firestore';

// ── Firebase config ─────────────────────────────────────────────────────────

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

// Singleton initialisation — safe for Next.js hot-reload
let app: FirebaseApp;
let db: Firestore;

function getFirebaseApp(): FirebaseApp {
    if (!app) {
        app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    }
    return app;
}

export function getDb(): Firestore {
    if (!db) {
        db = getFirestore(getFirebaseApp());
    }
    return db;
}

// ── Policy schema ────────────────────────────────────────────────────────────

export interface PolicyWorkflowStep {
    step: string;
    description: string;
}

export interface PolicyDecisionTree {
    question: string;
    yes: PolicyDecisionTree | { action: string };
    no: PolicyDecisionTree | { action: string };
}

export interface PolicyDocument {
    id?: string;
    title: string;
    input_text: string;
    workflow: PolicyWorkflowStep[];
    decision_tree: PolicyDecisionTree;
    checklist: string[];
    created_at: Timestamp | Date;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const COLLECTION = 'policies';

/**
 * Create a new policy document in Firestore.
 */
export async function createPolicy(
    data: Omit<PolicyDocument, 'id' | 'created_at'>
): Promise<PolicyDocument> {
    const db = getDb();
    const payload = {
        ...data,
        created_at: Timestamp.now(),
    };

    console.log("Attempting DB write");
    try {
        const docRef = await addDoc(collection(db, COLLECTION), payload);
        console.log("DB write success");
        return {
            id: docRef.id,
            ...payload,
        };
    } catch (error) {
        console.error("DB write failed:", error);
        return {
            id: `temp-${Date.now()}`,
            ...payload,
        };
    }
}

/**
 * Fetch all policies, ordered by newest first.
 */
export async function getPolicies(): Promise<PolicyDocument[]> {
    const db = getDb();
    const q = query(collection(db, COLLECTION), orderBy('created_at', 'desc'));

    try {
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<PolicyDocument, 'id'>),
        }));
    } catch (error) {
        console.error("Firestore read failed (getPolicies):", error);
        return [];
    }
}

/**
 * Fetch a single policy by Firestore document ID.
 */
export async function getPolicyById(id: string): Promise<PolicyDocument | null> {
    const db = getDb();
    const docRef = doc(db, COLLECTION, id);

    try {
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) return null;

        return {
            id: snapshot.id,
            ...(snapshot.data() as Omit<PolicyDocument, 'id'>),
        };
    } catch (error) {
        console.error("Firestore read failed (getPolicyById):", error);
        return null; // Return null if fetching fails
    }
}
