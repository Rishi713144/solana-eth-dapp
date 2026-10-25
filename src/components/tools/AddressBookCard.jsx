import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { isAddress } from 'ethers';
import { Contact, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AssetIcon } from '@/components/ui/asset-icon';
import { CopyButton } from '@/components/ui/copy-button';
import { useAddressBook } from '@/hooks/useAddressBook';
import { useToast } from '@/components/providers/ToastProvider';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { shortenAddress } from '@/lib/format';
import { cn } from '@/lib/utils';

export function AddressBookCard() {
  const { contacts, addContact, removeContact } = useAddressBook();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState('sol');
  const [error, setError] = useState('');

  function handleAdd(event) {
    event.preventDefault();
    setError('');
    const clean = address.trim();
    if (!label.trim()) {
      setError('Add a label for this contact.');
      return;
    }
    if (chain === 'sol') {
      try {
        new PublicKey(clean);
      } catch {
        setError('Enter a valid Solana address.');
        return;
      }
    } else if (!isAddress(clean)) {
      setError('Enter a valid Ethereum address.');
      return;
    }
    addContact({ label, address: clean, chain });
    toast({ title: 'Contact saved', description: `${label} is now available in Send.`, variant: 'success' });
    setLabel('');
    setAddress('');
  }

  async function handleRemove(contact) {
    const ok = await confirm({
      title: `Remove ${contact.label}?`,
      description: 'This removes the contact from your local address book.',
      confirmLabel: 'Remove',
      variant: 'danger',
    });
    if (ok) {
      removeContact(contact.id);
      toast({ title: 'Contact removed', variant: 'info' });
    }
  }

  return (
    <Card className="rounded-3xl border-white/[0.07] bg-card/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
            <Contact size={18} />
          </div>
          <Badge tone="success">{contacts.length} saved</Badge>
        </div>
        <CardTitle className="pt-1 text-base">Address book</CardTitle>
        <p className="text-xs leading-relaxed text-slate-500">Save frequent recipients and use them instantly in Send.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAdd} className="space-y-2.5">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input value={label} onChange={(event) => { setLabel(event.target.value); setError(''); }} placeholder="Label (e.g. Savings)" />
            <div className="flex rounded-xl border border-white/[0.07] bg-white/[0.03] p-1">
              {['sol', 'eth'].map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setChain(item)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase transition sm:flex-none',
                    chain === item ? 'bg-white/[0.08] text-white' : 'text-slate-500',
                  )}
                >
                  <AssetIcon chain={item} size="sm" className="h-4 w-4 rounded text-[8px]" />
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              value={address}
              onChange={(event) => { setAddress(event.target.value.trim()); setError(''); }}
              placeholder={chain === 'sol' ? 'Solana address' : '0x… Ethereum address'}
              className="font-mono text-xs"
              spellCheck={false}
            />
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0" aria-label="Add contact">
              <Plus size={16} />
            </Button>
          </div>
          {error && <p className="text-xs font-medium text-rose-300">{error}</p>}
        </form>

        <div className="space-y-2">
          {contacts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-4 py-7 text-center">
              <p className="text-xs text-slate-500">No contacts yet. Add your first address above.</p>
            </div>
          )}
          {contacts.map(contact => (
            <div key={contact.id} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5">
              <AssetIcon chain={contact.chain} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">{contact.label}</p>
                <p className="truncate font-mono text-[10px] text-slate-500">{shortenAddress(contact.address, 8, 6)}</p>
              </div>
              <CopyButton value={contact.address} label={contact.label} />
              <Button size="icon-sm" variant="ghost" className="text-slate-500 hover:text-rose-300" onClick={() => handleRemove(contact)} aria-label={`Remove ${contact.label}`}>
                <Trash2 size={13} />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
