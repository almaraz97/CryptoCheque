export const MUMBAI_ADDRESS = "0x13881";
export const METAMASK_ERROR_CODE = 4902;

export const ContractAddressMapping = {
  mumbai: {
    cheq: "0x7338C511171c6cabf35195448921a4dD044fcef6",
    dai: "0xc5B6c09dc6595Eb949739f7Cd6A8d542C2aabF4b",
    weth: "0xe37F99b03C7B4f4d71eE20e8eF3AC4E138D47F80",
    selfSignedBroker: "0xa9f0CE52c8De7496F7137cF807A6D33df06C2C87",
    directPayModule: "0xA9d4f82045eB2E3BB7309740A7210402acD542cE",
  },
  local: {
    cheq: "0x5B631dD0d2984513C65A1b1538777FdF4E5f2B2A",
    dai: "0x982723cb1272271b5ee405A5F14E9556032d9308",
    weth: "0x612f8B2878Fc8DFB6747bc635b8B3DeDFDaeb39e",
    selfSignedBroker: "0x8Df6c6fb81d3d1DAAFCd5FD5564038b0d9006FbB",
    directPayModule: "0xa9f0CE52c8De7496F7137cF807A6D33df06C2C87",
  },
};

export const contractMappingForChainId = (chainId: number) => {
  switch (chainId) {
    case 80001:
      return ContractAddressMapping.mumbai;
    case 31337:
      return ContractAddressMapping.local;
    default:
      return undefined;
  }
};

export interface ChainInfo {
  displayName: string;
  name: string;
  chainId: string;
  logoSrc: string;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  isDisabled?: boolean;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const chainNumberToChainHex = (chainId: number) => {
  return "0x" + chainId.toString(16);
}

export const chainInfoForChainId = (chainId: number) => {
  return deployedChains["0x" + chainId.toString(16)];
}

export const deployedChains: Record<string, ChainInfo> = {
  "0x13881": {
    displayName: "Polygon Mumbai",
    name: "Polygon Testnet Mumbai",
    chainId: "0x13881",
    logoSrc: "/logos/polygon-logo.svg",
    nativeCurrency: {
      name: "Matic",
      symbol: "MATIC",
      decimals: 18,
    },
    blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
    rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
  },
  "0xAEF3": {
    isDisabled: true,
    name: "Celo Testnet Alfajores",
    displayName: "Celo Alfajores",
    chainId: "0xAEF3",
    logoSrc: "/logos/celo-logo.svg",
    nativeCurrency: {
      name: "Celo",
      symbol: "CELO",
      decimals: 18,
    },
    blockExplorerUrls: ["https://alfajores-blockscout.celo-testnet.org/"],
    rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
  },
  "0x1": {
    isDisabled: true,
    name: "Ethereum Mainnet",
    displayName: "Ethereum",
    chainId: "0x1",
    logoSrc: "/logos/ethereum-logo.svg",
    blockExplorerUrls: ["https://etherscan.io/"],
    rpcUrls: ["https://eth.llamarpc.com"],
  },
};