import { DownloadIcon } from "@chakra-ui/icons";
import { Center, HStack, Spinner, Tag, Text, VStack } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useBlockchainData } from "../../../context/BlockchainDataProvider";
import { Cheq } from "../../../hooks/useCheqs";
import { useCurrencyDisplayName } from "../../../hooks/useCurrencyDisplayName";
import { useFormatAddress } from "../../../hooks/useFormatAddress";
import { CheqCurrency } from "../../designSystem/CurrencyIcon";
import DetailsRow from "../../designSystem/DetailsRow";
import RoundedBox from "../../designSystem/RoundedBox";

interface Props {
  cheq: Cheq;
}

function CheqDetails({ cheq }: Props) {
  const { blockchainState } = useBlockchainData();
  const { explorer } = blockchainState;
  const [note, setNote] = useState<string | undefined>(undefined);
  const [file, setFile] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<string[] | undefined>(undefined);

  const [fileName, setFilename] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        if (cheq.uri) {
          const NOTE_URL = `https://gateway.lighthouse.storage/ipfs/${cheq.uri}`;
          const resp = await axios.get(NOTE_URL);
          setNote(resp.data.description);
          setTags(resp.data.tags);
          if (resp.data.file) {
            setFile(
              `https://gateway.lighthouse.storage/ipfs/${resp.data.file}`
            );
            setFilename(resp.data.filename);
          }
          setIsLoading(false);
        } else {
          setNote("");
        }
      } catch (error) {
        setNote("Error fetching note");
        console.log(error);
        setIsLoading(false);
      }
    }
    fetchData();
  }, [cheq.uri]);

  const { displayNameForCurrency } = useCurrencyDisplayName();
  const { formatAddress } = useFormatAddress();

  const moduleName = useMemo(() => {
    switch (cheq.moduleData.module) {
      case "escrow":
        return "Escrow";
      case "direct":
        return "Direct Pay";
    }
  }, [cheq.moduleData.module]);

  return (
    <VStack gap={4} mt={10} mb={6}>
      <RoundedBox px={6}>
        <VStack gap={0}>
          <DetailsRow
            title="Payer"
            value={formatAddress(cheq.payer)}
            copyValue={!cheq.isPayer ? cheq.payer : undefined}
          />
          <DetailsRow
            title="Recipient"
            value={formatAddress(cheq.payee)}
            copyValue={!cheq.isPayer ? undefined : cheq.payee}
          />
          {cheq.inspector && (
            <DetailsRow
              title="Inspector"
              value={formatAddress(cheq.inspector)}
              copyValue={!cheq.isInspector ? undefined : cheq.payee}
            />
          )}
          {cheq.dueDate && cheq.isInvoice && (
            <DetailsRow title="Due Date" value={cheq.dueDate.toDateString()} />
          )}
          <DetailsRow
            title="Created On"
            value={cheq.createdTransaction.date.toDateString()}
            link={`${explorer}${cheq.createdTransaction.hash}`}
          />
          {cheq.fundedTransaction && (
            <DetailsRow
              title="Funded Date"
              value={cheq.fundedTransaction.date.toDateString()}
              link={`${explorer}${cheq.fundedTransaction.hash}`}
            />
          )}
          <DetailsRow
            title="Payment Amount"
            value={
              String(cheq.amount) +
              " " +
              displayNameForCurrency(cheq.token as CheqCurrency)
            }
          />
          <DetailsRow
            title="Module"
            value={moduleName}
            tooltip="Funds are released immediately upon payment"
          />
        </VStack>
      </RoundedBox>
      {cheq.uri &&
        (!isLoading ? (
          <>
            {note && (
              <VStack gap={0} w="100%">
                <Text pl={6} fontWeight={600} w="100%" textAlign={"left"}>
                  Notes
                </Text>
                <RoundedBox p={4} mb={4}>
                  <Text fontWeight={300} textAlign={"left"}>
                    {note}
                  </Text>
                </RoundedBox>
              </VStack>
            )}
            {tags && (
              <VStack gap={0} w="100%">
                <Text pl={6} fontWeight={600} w="100%" textAlign={"left"}>
                  Tags
                </Text>
                <RoundedBox p={4} mb={4}>
                  <HStack spacing={4}>
                    {tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </HStack>
                </RoundedBox>
              </VStack>
            )}
            {file && (
              <VStack gap={0} w="100%">
                <Text pl={6} fontWeight={600} w="100%" textAlign={"left"}>
                  File
                </Text>
                <RoundedBox p={4} mb={4}>
                  <a href={file} target="_blank" download>
                    {fileName}
                    <DownloadIcon ml={2} />
                  </a>
                </RoundedBox>
              </VStack>
            )}
          </>
        ) : (
          <Center>
            <Spinner size="md" />
          </Center>
        ))}
    </VStack>
  );
}

export default CheqDetails;
