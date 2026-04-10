/* ══════════════════════════════════════════════════════
   SENTINEL ROBOTICS — Client-Side Auth Gate
   SHA-256 password verification + AES content decryption
   ══════════════════════════════════════════════════════ */

// The password hash (SHA-256 of the investor password)
// To change the password, run in console:
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR_PASSWORD'))
//     .then(h => console.log(Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('')))
// Then paste the hex string below.

const PASS_HASH = 'f6c55124a9183b618f99a951d8a1a33b70588d680b25507354dd98dbbe914957';

const SESSION_KEY = 'sentinel_auth';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function isAuthenticated() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!session) return false;
    if (Date.now() - session.ts > SESSION_DURATION) {
      localStorage.removeItem(SESSION_KEY);
      return false;
    }
    return session.verified === true;
  } catch {
    return false;
  }
}

function setAuthenticated() {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    verified: true,
    ts: Date.now()
  }));
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = '/gate.html';
}

async function verifyPassword(input) {
  const hash = await sha256(input.trim());
  return hash === PASS_HASH;
}

// Redirect to gate if not authenticated (for protected pages)
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/gate.html';
    return false;
  }
  return true;
}
