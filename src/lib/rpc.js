export class TimeoutError extends Error {
  constructor(label = 'Request', ms = 15000) {
    super(`${label} timed out after ${Math.round(ms / 1000)}s`);
    this.name = 'TimeoutError';
  }
}

export function withTimeout(promise, ms = 15000, label = 'Request') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(label, ms)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export function explorerCluster(network) {
  return `?cluster=${network}`;
}

export function explorerTxUrl(network, signature) {
  return `https://explorer.solana.com/tx/${signature}${explorerCluster(network)}`;
}

export function explorerAddressUrl(network, address) {
  return `https://explorer.solana.com/address/${address}${explorerCluster(network)}`;
}

export function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
