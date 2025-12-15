'use client'

import { WalletError } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react'
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui'
import dynamic from 'next/dynamic'
import { ReactNode, useCallback, useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'
import '@solana/wallet-adapter-react-ui/styles.css'

const WalletButtonComponent = () => {
  const { connected, connecting, disconnect, publicKey } = useWallet()
  const { setVisible } = useWalletModal()

  const handleClick = useCallback(() => {
    if (connected) {
      disconnect()
    } else {
      setVisible(true)
    }
  }, [connected, disconnect, setVisible])

  const label = useMemo(() => {
    if (connecting) return 'Connecting...'
    if (connected && publicKey) {
      const base58 = publicKey.toBase58()
      return `${base58.slice(0, 4)}...${base58.slice(-4)}`
    }
    return 'Connect Wallet'
  }, [connecting, connected, publicKey])

  return (
    <Button
      onClick={handleClick}
      variant={connected ? 'outline' : 'default'}
      size="sm"
      className="gap-2"
      disabled={connecting}
    >
      <Wallet className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )
}

export const WalletButton = dynamic(async () => WalletButtonComponent, {
  ssr: false,
})

export function SolanaProvider({ children }: { children: ReactNode }) {
  const { cluster } = useCluster()
  const endpoint = useMemo(() => cluster.endpoint, [cluster])
  const onError = useCallback((error: WalletError) => {
    console.error(error)
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} onError={onError} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
