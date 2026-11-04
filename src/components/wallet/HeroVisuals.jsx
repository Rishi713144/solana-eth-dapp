import { memo } from 'react';

/**
 * 3D Metallic 8-Petal Chrome Star/Flower emblem in a blue/cyan palette.
 * Replicates the floating 3D chrome emblem from the reference design.
 */
export const ChromeFlower3D = memo(function ChromeFlower3D({ className = 'h-16 w-16' }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 14px 24px rgba(37,99,235,0.35))' }}
    >
      <defs>
        <linearGradient id="flowerGrad" x1="15" y1="15" x2="105" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="25%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="75%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="shineGrad" x1="20" y1="20" x2="70" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#bae6fd" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="specularGlow" cx="40" cy="35" r="35" fx="40" fy="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 8 rounded chrome petals arranged symmetrically */}
      <g transform="rotate(-15 60 60)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
          <g key={angle} transform={`rotate(${angle} 60 60)`}>
            {/* Base Petal */}
            <rect
              x="52"
              y="12"
              width="16"
              height="44"
              rx="8"
              fill="url(#flowerGrad)"
              stroke="#bfdbfe"
              strokeWidth="0.8"
            />
            {/* Specular highlight on upper petals */}
            {index < 4 && (
              <rect
                x="54"
                y="14"
                width="6"
                height="28"
                rx="3"
                fill="url(#shineGrad)"
              />
            )}
          </g>
        ))}

        {/* Center hub */}
        <circle cx="60" cy="60" r="16" fill="url(#flowerGrad)" stroke="#dbeafe" strokeWidth="1.2" />
        <circle cx="56" cy="56" r="12" fill="url(#specularGlow)" />
      </g>
    </svg>
  );
});

/**
 * 3D Metallic Blue/Cyan Crypto Coin with perspective tilt, rim ridge, and embossed symbol.
 */
export const ChromeCoin3D = memo(function ChromeCoin3D({
  symbol = 'ETH',
  className = 'h-14 w-14',
  glowColor = 'rgba(59,130,246,0.3)',
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 12px 20px ${glowColor})` }}
    >
      <defs>
        <linearGradient id="coinFace" x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="30%" stopColor="#60a5fa" />
          <stop offset="70%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="coinEdge" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="45%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="coinShine" x1="25" y1="20" x2="60" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#7dd3fc" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Coin outer rim / 3D edge */}
      <circle cx="50" cy="52" r="42" fill="url(#coinEdge)" />
      <circle cx="50" cy="48" r="41" fill="url(#coinFace)" stroke="#e0f2fe" strokeWidth="1.2" />

      {/* Inner bevel groove */}
      <circle cx="50" cy="48" r="34" stroke="#bfdbfe" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />

      {/* Top light reflection */}
      <ellipse cx="44" cy="36" rx="26" ry="16" fill="url(#coinShine)" />

      {/* Embossed Symbol */}
      {symbol === 'ETH' && (
        <g transform="translate(36, 32) scale(0.9)" stroke="#ffffff" strokeWidth="1.5" fill="none">
          <polygon points="16,0 30,22 16,30 2,22" fill="#ffffff" fillOpacity="0.85" />
          <polygon points="16,33 30,25 16,44 2,25" fill="#ffffff" fillOpacity="0.7" />
          <polygon points="16,0 30,22 16,16" fill="#e0f2fe" fillOpacity="0.4" />
        </g>
      )}

      {symbol === '$' && (
        <text
          x="50"
          y="56"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="30"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
        >
          $
        </text>
      )}

      {symbol === 'SOL' && (
        <g transform="translate(35, 36) scale(0.75)" fill="#ffffff">
          <path d="M4 6.5h32l-6 6H4l6-6z" opacity="0.9" />
          <path d="M10 17.5h32l-6 6H10l6-6z" opacity="0.8" />
          <path d="M4 28.5h32l-6 6H4l6-6z" opacity="0.9" />
        </g>
      )}
    </svg>
  );
});

/**
 * 3D Metallic Security Shield for the "24/7 protection" card.
 */
export const ChromeShield3D = memo(function ChromeShield3D({ className = 'h-12 w-12' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 10px 18px rgba(37,99,235,0.35))' }}
    >
      <defs>
        <linearGradient id="shieldGrad" x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="40%" stopColor="#60a5fa" />
          <stop offset="75%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id="shieldShine" x1="25" y1="15" x2="60" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Shield Body */}
      <path
        d="M50 12 L84 24 C84 54 68 78 50 88 C32 78 16 54 16 24 Z"
        fill="url(#shieldGrad)"
        stroke="#e0f2fe"
        strokeWidth="1.5"
      />

      {/* Inner Bevel */}
      <path
        d="M50 20 L76 30 C76 54 64 72 50 80 C36 72 24 54 24 30 Z"
        fill="none"
        stroke="#93c5fd"
        strokeWidth="1"
        opacity="0.6"
      />

      {/* Specular Glint */}
      <path
        d="M50 16 L78 26 C78 45 70 60 50 72 Z"
        fill="url(#shieldShine)"
      />

      {/* Checkmark */}
      <path
        d="M38 50 L46 58 L64 38"
        stroke="#ffffff"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

/**
 * SVG Token Badges for Solana, Ethereum, USDC, and Bitcoin.
 */
export const TokenBadge = memo(function TokenBadge({ symbol, size = 26 }) {
  if (symbol === 'SOL') {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-teal-400 p-1 shadow-md"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" className="h-full w-full text-white" fill="currentColor">
          <path d="M4 6h16l-3 3H4l3-3zm3 5h16l-3 3H7l3-3zm-3 5h16l-3 3H4l3-3z" />
        </svg>
      </div>
    );
  }

  if (symbol === 'ETH') {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-blue-500 to-slate-800 p-1 shadow-md"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" className="h-full w-full text-white" fill="none" stroke="currentColor" strokeWidth="1.6">
          <polygon points="12 2 18 12 12 16 6 12" fill="white" fillOpacity="0.8" />
          <polygon points="12 17 18 13 12 22 6 13" fill="white" fillOpacity="0.6" />
        </svg>
      </div>
    );
  }

  if (symbol === 'USDC') {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white shadow-md"
        style={{ width: size, height: size }}
      >
        $
      </div>
    );
  }

  if (symbol === 'BTC') {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white shadow-md"
        style={{ width: size, height: size }}
      >
        ₿
      </div>
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-slate-700 text-[9px] font-semibold text-white"
      style={{ width: size, height: size }}
    >
      {symbol}
    </div>
  );
});

