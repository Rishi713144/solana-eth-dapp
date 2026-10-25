# Categorized Bugs, Fixes, Vulnerabilities & Improvements

## CRITICAL BUGS / VULNERABILITIES
- **Plaintext mnemonic in localStorage** (`src/App.jsx:13-29`) - Entire 12-word mnemonic stored unencrypted in `localStorage['sikka_mnemonic']`. XSS can steal it; persists across sessions.
- **No encryption of sensitive data** - Mnemonic/keys never encrypted at rest.
- **Garbled status strings** - Corrupted unicode (`?o.`, `??O`) in status messages (`RequestAirdrop.jsx`, `SendTokens.jsx`, `SignMessage.jsx`).
- **XSS ? full wallet compromise** - Plaintext mnemonic is catastrophic if injection occurs.

## FUNCTIONAL BUGS
- **Internal wallets disconnected from dApp tools** - App derives Solana/Eth wallets internally (`SolanaWallet.jsx`, `EthWallet.jsx`) but tools only work with external wallet-adapter connected wallets. Tools won't work with app's generated wallets.
- **EthWallet is display-only** - Addresses generated/copiable, but no balances, sending, or tool integration.
- **SolanaWallet limitations** - Balances fetched once on index change with no refresh; display-only in practice.
- **ActivityFeed fetches only first derived account** - Hardcoded to `m/44'/501'/0'/0'` (`ActivityFeed.jsx:24`), ignoring other accounts.
- **TokenLaunchpad multi-tx flow** - Three sequential transactions sent without confirmation waits between them (`TokenLaunchpad.jsx:103-156`). Prone to RPC/latency failures.
- **Inconsistent derivation patterns** - Solana uses `derivePath` on seed hex; Eth uses `ethers.HDNodeWallet.fromSeed`. Different approaches, not uniform.

## SECURITY VULNERABILITIES
- **Clipboard exposure** - Copying addresses/keys with no warnings.
- **Error message leakage** - Partial error messages shown to UI (`SendTokens.jsx:48`, `TokenLaunchpad.jsx:156`) could leak RPC/internal details.
- **No input validation** - `SendTokens` doesn't validate Solana address format before `new PublicKey()`; minimal amount validation.
- **Devnet hardcoded everywhere** - No network switching/configuration.
- **Insecure storage model** - No session lock, timeout, or secure storage.

## IMPROVEMENTS NEEDED
- **Encrypt mnemonic at rest** - Use WebCrypto (AES-GCM) with PBKDF2 from user password, or sessionStorage + lock mechanism. Never store raw mnemonic in localStorage.
- **Integrate internal wallets with tools** - Add direct signing with derived keypairs or connect derived wallets to adapter.
- **Fix encoding issues** - Replace garbled unicode strings with proper text.
- **Balance refresh/subscriptions** - Add refresh buttons or auto-refresh for Solana/Eth balances.
- **Improve ActivityFeed** - Support all derived accounts, add pagination/loading states.
- **TokenLaunchpad robustness** - Add confirmation waits, better error handling, input validation (supply, URLs).
- **Network switching** - Support devnet/mainnet/testnet.
- **Account management** - Rename/delete accounts, export keys (with warnings), import specific indices.
- **Security hardening** - Add CSP, input sanitization, better error handling.
- **Code quality** - Empty README, no tests, inconsistent styling, consider TypeScript.

## IMPLEMENTATIONS NEEDED
- **Encrypted storage layer** for mnemonic/keys
- **Direct transaction signing** using derived keypairs (for internal wallets)
- **Proper confirmation strategy** for multi-tx flows (TokenLaunchpad)
- **Better state management** (mnemonic handling, accounts)
- **QR code generation** for addresses
- **Fee estimation** display
- **Transaction simulation** before sending

## PRIORITY FIXES (fast)
1. **CRITICAL**: Replace plaintext localStorage mnemonic with encrypted storage or remove persistence of raw mnemonic. Add strong warnings.
2. **HIGH**: Fix garbled unicode strings in status messages.
3. **HIGH**: Make tools functional with either internal or external wallets (resolve disconnect).
4. **MEDIUM**: Add address validation, better error handling, transaction confirmations.
