import { useState } from "react";

import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  Spacer,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import Image from "next/image";

import { useBlockchainData } from "../../context/BlockchainDataProvider";
import { deployedChains } from "../../context/chainInfo";
import { switchNetwork } from "../../context/SwitchNetwork";
import StyledMenuItem from "../designSystem/StyledMenuItem";

export default function ChainSwitcher() {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { blockchainState } = useBlockchainData();
  const { chainId } = blockchainState;

  const filteredChains = Object.values(deployedChains).map((chain) => {
    const { displayName, chainId, logoSrc, isDisabled } = chain;
    return { displayName, chainId, logoSrc, isDisabled };
  });

  const [selectedChain, setSelectedChain] = useState(
    filteredChains.find((chain) => chain.chainId === chainId) ??
      filteredChains[0]
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectChain = async (chain: {
    displayName: string;
    chainId: string;
    logoSrc: string;
    isDisabled?: boolean;
  }) => {
    const { displayName, chainId, logoSrc, isDisabled } = chain;
    setSelectedChain({ displayName, chainId, logoSrc, isDisabled });
    setIsOpen(false);
    await switchNetwork(chain.chainId);
  };

  return (
    <Menu isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <MenuButton
        as={Button}
        variant="ghost"
        rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        size="sm"
        mr={2}
        aria-label="Select chain"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Flex alignItems="center">
          <Image
            src={selectedChain.logoSrc}
            alt={selectedChain.displayName}
            width={20}
            height={20}
            unoptimized={true}
          />
          <Spacer mx="1" />
          {isMobile ? null : (
            <Text fontSize="lg">{selectedChain.displayName}</Text>
          )}
        </Flex>
      </MenuButton>
      <MenuList bg="brand.100">
        {filteredChains.map((chain) => (
          <StyledMenuItem
            key={chain.chainId}
            onClick={() => handleSelectChain(chain)}
            isDisabled={chain.isDisabled}
          >
            <Flex alignItems="center">
              <Image
                src={chain.logoSrc}
                alt={chain.displayName}
                width={20}
                height={20}
                unoptimized={true}
              />
              <Spacer mx="1" />
              {chain.displayName}
            </Flex>
          </StyledMenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
