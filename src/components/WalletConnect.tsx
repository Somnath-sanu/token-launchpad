"use client";
import React, { FC } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";

import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

const WalletConnectButton: FC = () => {
  const { connected } = useWallet();

  return (
    <div className="flex flex-col justify-center right-2.5 sm:top-1 top-0.5 sm:right-4 absolute z-10 w-fit ">
      <WalletMultiButton />
      {!connected && (
        <div className="py-4 mx-auto">
          <div className="animate-bounce text-4xl">👆</div>
        </div>
      )}
    </div>
  );
};

export const WalletWrapper: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT!;

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <WalletConnectButton />
          <WalletContent>{children}</WalletContent>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const WalletContent: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="text-3xl mb-4">Please connect your wallet</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default WalletWrapper;
