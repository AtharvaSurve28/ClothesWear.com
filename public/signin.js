import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbn4YxxzM3jqrdth5GKwz-8k4mIzgWN4I",
  authDomain: "clotheswear-91373.firebaseapp.com",
  projectId: "clotheswear-91373",
  storageBucket: "clotheswear-91373.firebasestorage.app",
  messagingSenderId: "1060664923757",
  appId: "1:1060664923757:web:3101e28c3c41e4b6b39164",
  measurementId: "G-HRRN64P451"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Get form elements
const signInForm = document.getElementById('signInForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberCheckbox = document.getElementById('remember');
const createAccountLink = document.querySelector('.create-account-link a');
const forgotPasswordLink = document.querySelector('.forgot-password');

let googleSignInBtn = document.querySelector('.btn-google');

if (!googleSignInBtn) {
  console.error('Google sign-in button not found!');
}

// Helper function to initialize profile on Express server
async function initializeProfileOnServer(user) {
  try {
    const idToken = await user.getIdToken();
    
    const response = await fetch('/api/profile/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        name: user.displayName || 'User',
        email: user.email,
        avatar: user.photoURL || ''
      })
    });

    const data = await response.json();
    console.log('Profile initialized on server:', data);
  } catch (error) {
    console.error('Error initializing profile on server:', error);
  }
}

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('User already logged in:', user.email);
    // Redirect to profile page
    window.location.href = '/profile.html';
  }
});

// Google Sign-In Button
if (googleSignInBtn) {
  googleSignInBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log('Google button clicked!');

    googleSignInBtn.textContent = 'Signing in with Google...';
    googleSignInBtn.disabled = true;

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('Google sign-in successful:', user.email);

      // Check if user profile exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      // If user doesn't exist, create their profile
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: user.displayName || 'User',
          email: user.email,
          avatar: user.photoURL || '',
          createdAt: new Date()
        });
      }

      // Initialize profile on Express server
      await initializeProfileOnServer(user);

      showSuccess('Google sign-in successful! Redirecting...');
      
      setTimeout(() => {
        window.location.href = '/profile.html'; // Redirect to profile page
      }, 1000);

    } catch (error) {
      console.error('Google sign-in error:', error.code, error.message);
      
      let errorMessage = 'Google sign-in failed. Please try again.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Sign-in popup was blocked. Please allow popups.';
      }
      
      showError(errorMessage);
    } finally {
      googleSignInBtn.innerHTML = '<img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo"> Sign in with Google';
      googleSignInBtn.disabled = false;
    }
  });
}

// Sign In Form Submit
signInForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }

  const signInButton = signInForm.querySelector('.btn-primary');
  const originalText = signInButton.textContent;
  signInButton.textContent = 'Signing in...';
  signInButton.disabled = true;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (userDoc.exists()) {
      console.log('User profile:', userDoc.data());
    }

    // Initialize profile on Express server
    await initializeProfileOnServer(user);

    // Store "Remember me" preference
    if (rememberCheckbox.checked) {
      localStorage.setItem('rememberEmail', email);
    } else {
      localStorage.removeItem('rememberEmail');
    }

    showSuccess('Sign in successful! Redirecting...');
    
    setTimeout(() => {
      window.location.href = '/profile.html'; // Redirect to profile page
    }, 1000);

  } catch (error) {
    console.error('Error during sign-in:', error.code);
    
    let errorMessage = 'An error occurred. Please try again.';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Email not found. Please create an account.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }
    
    showError(errorMessage);
  } finally {
    signInButton.textContent = originalText;
    signInButton.disabled = false;
  }
});

// Load remembered email
window.addEventListener('load', () => {
  const rememberedEmail = localStorage.getItem('rememberEmail');
  if (rememberedEmail) {
    emailInput.value = rememberedEmail;
    rememberCheckbox.checked = true;
  }
});

// Create Account Link
createAccountLink.addEventListener('click', (e) => {
  e.preventDefault();
  showSignUpModal();
});

// Forgot Password Link
forgotPasswordLink.addEventListener('click', (e) => {
  e.preventDefault();
  showForgotPasswordModal();
});

// Sign Up Modal
function showSignUpModal() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;

  modal.innerHTML = `
    <div style="background: white; padding: 40px; border-radius: 12px; max-width: 400px; width: 90%; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);">
      <h3 style="font-size: 1.5rem; margin-bottom: 20px; color: #101828;">Create Account</h3>
      <div style="display: flex; flex-direction: column; gap: 15px;">
        <div>
          <label style="display: block; font-size: 0.9rem; font-weight: 500; color: #344054; margin-bottom: 8px;">Full Name</label>
          <input type="text" id="signupName" placeholder="Your full name" style="width: 100%; padding: 12px; border: 1px solid #D0D5DD; border-radius: 8px; font-size: 1rem; box-sizing: border-box;">
        </div>
        <div>
          <label style="display: block; font-size: 0.9rem; font-weight: 500; color: #344054; margin-bottom: 8px;">Email</label>
          <input type="email" id="signupEmail" placeholder="your@email.com" style="width: 100%; padding: 12px; border: 1px solid #D0D5DD; border-radius: 8px; font-size: 1rem; box-sizing: border-box;">
        </div>
        <div>
          <label style="display: block; font-size: 0.9rem; font-weight: 500; color: #344054; margin-bottom: 8px;">Password</label>
          <input type="password" id="signupPassword" placeholder="Minimum 6 characters" style="width: 100%; padding: 12px; border: 1px solid #D0D5DD; border-radius: 8px; font-size: 1rem; box-sizing: border-box;">
        </div>
        <div id="signupError" style="color: #d32f2f; font-size: 0.9rem; display: none;"></div>
        <button id="signupSubmit" style="width: 100%; padding: 12px; background: #0C1829; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer;">Sign Up</button>
        <button id="closeModal" style="width: 100%; padding: 12px; background: #F4F6F8; color: #344054; border: 1px solid #D0D5DD; border-radius: 8px; font-size: 1rem; cursor: pointer;">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = document.getElementById('closeModal');
  const signupSubmit = document.getElementById('signupSubmit');

  closeBtn.addEventListener('click', () => {
    modal.remove();
  });

  signupSubmit.addEventListener('click', async () => {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const errorDiv = document.getElementById('signupError');

    if (!name || !email || !password) {
      errorDiv.textContent = 'Please fill in all fields';
      errorDiv.style.display = 'block';
      return;
    }

    if (password.length < 6) {
      errorDiv.textContent = 'Password must be at least 6 characters';
      errorDiv.style.display = 'block';
      return;
    }

    signupSubmit.textContent = 'Creating account...';
    signupSubmit.disabled = true;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        avatar: '',
        createdAt: new Date()
      });

      // Initialize profile on Express server
      await initializeProfileOnServer(user);

      showSuccess('Account created! Redirecting...');
      modal.remove();
      
      // Redirect to profile page
      setTimeout(() => {
        window.location.href = '/profile.html';
      }, 1000);

    } catch (error) {
      let errorMessage = 'An error occurred';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      errorDiv.textContent = errorMessage;
      errorDiv.style.display = 'block';
    } finally {
      signupSubmit.textContent = 'Sign Up';
      signupSubmit.disabled = false;
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #fee;
    color: #d32f2f;
    padding: 15px 20px;
    border-radius: 8px;
    border-left: 4px solid #d32f2f;
    z-index: 999;
    max-width: 400px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

function showSuccess(message) {
  const successDiv = document.createElement('div');
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #e8f5e9;
    color: #2e7d32;
    padding: 15px 20px;
    border-radius: 8px;
    border-left: 4px solid #2e7d32;
    z-index: 999;
    max-width: 400px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  `;
  successDiv.textContent = message;
  document.body.appendChild(successDiv);

  setTimeout(() => {
    successDiv.remove();
  }, 5000);
}

function showForgotPasswordModal() {
  alert('Password reset functionality coming soon!');
}