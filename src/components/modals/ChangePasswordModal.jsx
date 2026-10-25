import { useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/providers/ToastProvider';
import { changeVaultPassword } from '@/utils/secureStorage';

export function ChangePasswordModal({ open, onClose }) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShow(false);
    setError('');
    setLoading(false);
  }, [open]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('Choose a password different from your current one.');
      return;
    }
    setLoading(true);
    const ok = await changeVaultPassword(currentPassword, newPassword);
    setLoading(false);
    if (!ok) {
      setError('Current password is incorrect.');
      return;
    }
    toast({ title: 'Password updated', description: 'Your vault has been re-encrypted.', variant: 'success' });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Change vault password" description="Re-encrypt your recovery phrase with a new password." size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-violet-300">
          <KeyRound size={24} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500" htmlFor="current-password">Current password</label>
          <div className="relative">
            <Input
              id="current-password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => { setCurrentPassword(event.target.value); setError(''); }}
              className="pr-11"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow(value => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:text-white"
              aria-label={show ? 'Hide passwords' : 'Show passwords'}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500" htmlFor="new-password">New password</label>
          <Input
            id="new-password"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => { setNewPassword(event.target.value); setError(''); }}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500" htmlFor="confirm-password">Confirm new password</label>
          <Input
            id="confirm-password"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => { setConfirmPassword(event.target.value); setError(''); }}
          />
        </div>
        {error && (
          <p className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-3.5 py-2.5 text-xs font-medium text-rose-300">{error}</p>
        )}
        <Button type="submit" size="lg" className="h-12 w-full" loading={loading} disabled={!currentPassword || !newPassword || !confirmPassword}>
          Update password
        </Button>
      </form>
    </Modal>
  );
}
