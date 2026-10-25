const LOCK_KEY = 'vela_session_lock';
const TIMEOUT_KEY = 'vela_autolock_minutes';
const DEFAULT_TIMEOUT_MINUTES = 15;

export const AUTO_LOCK_OPTIONS = [5, 15, 30, 60];

export function setSessionActive() {
  try {
    localStorage.setItem(LOCK_KEY, Date.now().toString());
  } catch {
    // ignore
  }
}

export function touchSession() {
  setSessionActive();
}

export function isSessionExpired() {
  try {
    const last = localStorage.getItem(LOCK_KEY);
    if (!last) return true;
    return Date.now() - Number.parseInt(last, 10) > getAutoLockMinutes() * 60000;
  } catch {
    return true;
  }
}

export function getAutoLockMinutes() {
  try {
    const stored = Number.parseInt(localStorage.getItem(TIMEOUT_KEY) || '', 10);
    if (AUTO_LOCK_OPTIONS.includes(stored)) return stored;
  } catch {
    // ignore
  }
  return DEFAULT_TIMEOUT_MINUTES;
}

export function setAutoLockMinutes(minutes) {
  try {
    const safe = AUTO_LOCK_OPTIONS.includes(Number(minutes)) ? Number(minutes) : DEFAULT_TIMEOUT_MINUTES;
    localStorage.setItem(TIMEOUT_KEY, String(safe));
    setSessionActive();
    return safe;
  } catch {
    return DEFAULT_TIMEOUT_MINUTES;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(LOCK_KEY);
  } catch {
    // ignore
  }
}
