import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/providers/ToastProvider';

export async function copyToClipboard(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const input = document.createElement('textarea');
      input.value = value;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      return true;
    } catch {
      return false;
    }
  }
}

export function CopyButton({ value, label = 'Address', className, showLabel = false, size = 14 }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function handleCopy() {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      toast({ title: `${label} copied`, variant: 'success', duration: 2200 });
      window.setTimeout(() => setCopied(false), 1800);
    } else {
      toast({ title: 'Could not copy', description: 'Clipboard access is unavailable.', variant: 'error' });
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white',
        className,
      )}
      aria-label={`Copy ${label}`}
    >
      {copied ? <Check size={size} className="text-emerald-400" /> : <Copy size={size} />}
      {showLabel && <span>{copied ? 'Copied' : 'Copy'}</span>}
    </button>
  );
}
