import { AirdropCard } from './AirdropCard';
import { SignMessageCard } from './SignMessageCard';
import { AddressBookCard } from './AddressBookCard';

export function ToolsPage({ wallet, onRefresh }) {
  const primary = wallet.solAccounts[0];
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <AirdropCard account={primary} onDone={onRefresh} />
      <SignMessageCard account={primary} />
      <div className="lg:col-span-2">
        <AddressBookCard />
      </div>
    </div>
  );
}
