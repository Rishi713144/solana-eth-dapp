import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { Brand } from './Brand';

export const Navbar = ({ onReset }) => (
  <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.06] bg-background/70 backdrop-blur-2xl">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
      <Brand onClick={onReset} subtitle="Your keys. Every chain." />
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:flex">
          <ShieldCheck size={12} className="text-emerald-400" />
          Local vault
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          <LockKeyhole size={12} className="text-violet-300" />
          AES-256
        </span>
      </div>
    </div>
  </header>
);
