import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  Select,
} from "@chakra-ui/react";
import AccountField from "../../../components/input/AccountField";
import AmountField from "../../../components/input/AmountField";
import ModeSelect from "./ModeSelect";

interface Props {
  isInvoice: boolean;
}

function DetailsBox({ isInvoice }: Props) {
  return (
    <Box borderRadius={10} padding={6} bg="gray.700" w="100%" h="140px">
      <Grid
        templateColumns="2fr 3fr"
        templateRows="repeat(2, 1fr)"
        gap={6}
        h="100%"
      >
        <GridItem>
          <Flex alignItems={"center"} justifyContent={"space-between"}>
            <FormLabel>You are</FormLabel>
            <ModeSelect isInvoice={isInvoice} />
          </Flex>
        </GridItem>
        <GridItem>
          <Flex alignItems={"center"} justifyContent={"space-between"}>
            <FormLabel noOfLines={1} flexShrink={0}>
              Client Address
            </FormLabel>
            <FormControl>
              <AccountField fieldName="address" placeholder="0x" />
            </FormControl>
          </Flex>
        </GridItem>
        <GridItem>
          <Flex alignItems={"center"} justifyContent={"space-between"}>
            <FormLabel>Amount</FormLabel>
            <AmountField />
          </Flex>
        </GridItem>
        <GridItem>
          <Flex alignItems={"center"} justifyContent={"space-between"}>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Input />
            </FormControl>
          </Flex>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default DetailsBox;
