/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import WalletWrapper from "./WalletConnect";

const withWallet = (Component: React.ComponentType) => {
  return (props: any) => (
    <WalletWrapper>
      <Component {...props} />
    </WalletWrapper>
  );
};

export default withWallet;
