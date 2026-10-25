import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getNetwork, setNetwork as persistNetwork, getNetworkConfig } from '@/config/network';

const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  const [network, setNetworkState] = useState(getNetwork);

  const switchNetwork = useCallback((next) => {
    persistNetwork(next);
    setNetworkState(next);
  }, []);

  const value = useMemo(() => ({
    network,
    config: getNetworkConfig(network),
    setNetwork: switchNetwork,
  }), [network, switchNetwork]);

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) throw new Error('useNetwork must be used inside NetworkProvider');
  return context;
}
