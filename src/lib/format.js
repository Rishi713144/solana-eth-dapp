export function shortenAddress(address, start = 4, end = 4) {
  if (!address || typeof address !== 'string') return '';
  if (address.length <= start + end + 3) return address;
  return `${address.slice(0, start)}…${address.slice(-end)}`;
}

export function formatToken(value, maxDecimals = 4) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0';
  if (num === 0) return '0';
  if (num > 0 && num < 0.0001) return '<0.0001';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  }).format(num);
}

export function formatUsd(value, compact = false) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '$0.00';
  if (compact && Math.abs(num) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(num);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: num > 0 && num < 1 ? 4 : 2,
  }).format(num);
}

export function formatPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0.00%';
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
}

export function timeAgo(input) {
  if (!input) return 'just now';
  const timestamp = typeof input === 'number' ? (input < 1e12 ? input * 1000 : input) : new Date(input).getTime();
  const diff = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function formatDateTime(input) {
  if (!input) return '';
  const timestamp = typeof input === 'number' ? (input < 1e12 ? input * 1000 : input) : new Date(input).getTime();
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function avatarGradient(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const palettes = [
    'linear-gradient(135deg, #7c5cff 0%, #22d3ee 100%)',
    'linear-gradient(135deg, #f472b6 0%, #7c5cff 100%)',
    'linear-gradient(135deg, #22d3ee 0%, #34d399 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #f472b6 100%)',
    'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
    'linear-gradient(135deg, #2dd4bf 0%, #6366f1 100%)',
  ];
  return palettes[Math.abs(hash) % palettes.length];
}

export function truncateText(text, length = 32) {
  if (!text || text.length <= length) return text || '';
  return `${text.slice(0, length)}…`;
}
