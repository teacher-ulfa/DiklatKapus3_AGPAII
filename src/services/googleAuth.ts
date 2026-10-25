import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

const TOKEN_STORAGE_KEY = 'diklat_google_access_token_v4';

let isSigningIn = false;
let cachedAccessToken: string | null =
  typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_STORAGE_KEY) : null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken || '');
      }
    } else {
      cachedAccessToken = null;
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch {
          // Ignore
        }
      }
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal memperoleh akses token Google Workspace');
    }

    cachedAccessToken = credential.accessToken;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, cachedAccessToken);
      } catch {
        // Ignore
      }
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
};
