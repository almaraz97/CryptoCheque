import {
  Button,
  Center,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";


// query current chain ID to see if its the same
const networkForChainId = (chainId: string) => {
  switch (chainId) {
    case "0x61":
      return {
        chainId,
        chainName: "Polygon Testnet Mumbai",
        nativeCurrency: {
          name: "Matic",
          symbol: "MATIC", // 2-6 characters long
          decimals: 18,
        },
        blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
        rpcUrls: ["https://matic-mumbai.chainstacklabs.com"],
      };
    default:
      return undefined;
  }
};

const switchNetwork = async (chainId: string) => {
  try {
    await (window as any).ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId : "0x13881" }], // chainId must be in hexadecimal numbers
    });
  } catch (error: any) {
    if (error.code === 4902) {
      try {
        const network = networkForChainId(chainId);
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [network],
        });
      } catch (addError) {
        console.error(addError);
      }
    }
  }
};

export default function SwitchNetworkMenu() {
  return (
    <Menu>
      <MenuButton as={Button}>Switch Chain</MenuButton>
      <MenuList alignItems={"center"}>
        <Center>
          <p>Switch Network</p>
        </Center>
        <MenuDivider />
        <MenuItem onClick={() => switchNetwork("0x7a69")}>Localhost</MenuItem>
        <MenuItem onClick={() => switchNetwork("0x13881")}>Mumbai</MenuItem>
      </MenuList>
    </Menu>
  );
}
