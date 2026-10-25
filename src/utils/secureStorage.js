const VAULT_KEY = 'vela_vault_v2';
const LEGACY_ENCRYPTED_KEY = 'sikka_mnemonic_enc';
const LEGACY_PLAIN_KEY = 'sikka_mnemonic';
const SALT_LEN = 16;
const IV_LEN = 12;
const ITERATIONS = 210000;
const LEGACY_ITERATIONS = 100000;
const LEGACY_SALT = 'sikkaone-salt-v1';

function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(passphrase, salt, iterations) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptMnemonic(mnemonic, passphrase) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await deriveKey(passphrase, salt, ITERATIONS);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(mnemonic));
  return {
    version: 2,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ct: bytesToBase64(new Uint8Array(ciphertext)),
    iterations: ITERATIONS,
    createdAt: new Date().toISOString(),
  };
}

async function decryptV2(vault, passphrase) {
  const dec = new TextDecoder();
  const salt = base64ToBytes(vault.salt);
  const iv = base64ToBytes(vault.iv);
  const data = base64ToBytes(vault.ct);
  const key = await deriveKey(passphrase, salt, vault.iterations || ITERATIONS);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return dec.decode(plain);
}

async function decryptLegacy(vault, passphrase) {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const key = await deriveKey(passphrase, enc.encode(LEGACY_SALT), LEGACY_ITERATIONS);
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(vault.iv) },
    key,
    new Uint8Array(vault.ct),
  );
  return dec.decode(plain);
}

export async function createVault(mnemonic, passphrase) {
  if (!mnemonic || !passphrase) throw new Error('Wallet and password are required');
  const vault = await encryptMnemonic(mnemonic, passphrase);
  localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
  return true;
}

export async function unlockVault(passphrase) {
  if (!passphrase) return null;
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (raw) {
      const vault = JSON.parse(raw);
      return await decryptV2(vault, passphrase);
    }

    const legacyRaw = localStorage.getItem(LEGACY_ENCRYPTED_KEY);
    if (!legacyRaw) return null;
    const legacyVault = JSON.parse(legacyRaw);
    const mnemonic = await decryptLegacy(legacyVault, passphrase);
    if (mnemonic) {
      await createVault(mnemonic, passphrase);
      localStorage.removeItem(LEGACY_ENCRYPTED_KEY);
    }
    return mnemonic;
  } catch {
    return null;
  }
}

export async function verifyVaultPassword(passphrase) {
  const mnemonic = await unlockVault(passphrase);
  return Boolean(mnemonic);
}

export async function changeVaultPassword(currentPassword, nextPassword) {
  const mnemonic = await unlockVault(currentPassword);
  if (!mnemonic) return false;
  await createVault(mnemonic, nextPassword);
  return true;
}

export function hasVault() {
  try {
    return Boolean(localStorage.getItem(VAULT_KEY) || localStorage.getItem(LEGACY_ENCRYPTED_KEY));
  } catch {
    return false;
  }
}

export function hasEncryptedMnemonic() {
  return hasVault();
}

export function getLegacyPlainMnemonic() {
  try {
    const value = localStorage.getItem(LEGACY_PLAIN_KEY);
    return value && value.trim().split(/\s+/).length >= 12 ? value.trim() : '';
  } catch {
    return '';
  }
}

export function clearLegacyPlainMnemonic() {
  try {
    localStorage.removeItem(LEGACY_PLAIN_KEY);
  } catch {
    // ignore
  }
}

export function clearVault() {
  try {
    localStorage.removeItem(VAULT_KEY);
    localStorage.removeItem(LEGACY_ENCRYPTED_KEY);
    localStorage.removeItem(LEGACY_PLAIN_KEY);
  } catch {
    // ignore
  }
}

export function getVaultCreatedAt() {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return null;
    return JSON.parse(raw).createdAt || null;
  } catch {
    return null;
  }
}

export { LEGACY_PLAIN_KEY };
