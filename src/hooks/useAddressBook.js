import { useCallback, useState } from 'react';
import { readJson, writeJson, randomId } from '@/lib/rpc';

const STORAGE_KEY = 'vela_address_book';

export function useAddressBook() {
  const [contacts, setContacts] = useState(() => {
    const stored = readJson(STORAGE_KEY, []);
    return Array.isArray(stored) ? stored : [];
  });

  const addContact = useCallback((contact) => {
    const entry = {
      id: randomId(),
      label: contact.label?.trim() || 'Untitled',
      address: contact.address.trim(),
      chain: contact.chain === 'eth' ? 'eth' : 'sol',
      createdAt: new Date().toISOString(),
    };
    setContacts(previous => {
      const next = [entry, ...previous.filter(item => item.address !== entry.address)];
      writeJson(STORAGE_KEY, next);
      return next;
    });
    return entry;
  }, []);

  const removeContact = useCallback((id) => {
    setContacts(previous => {
      const next = previous.filter(item => item.id !== id);
      writeJson(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { contacts, addContact, removeContact };
}
