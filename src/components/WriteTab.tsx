import { ethers } from "ethers";

import { Form, Formik } from "formik";

import { Button, Flex, FormLabel, Stack } from "@chakra-ui/react";

import TokenField from "./input/TokenField";
import AmountField from "./input/AmountField";
import AccountField from "./input/AccountField";
import DurationField from "./input/DurationField";
import { useBlockchainData } from "../context/BlockchainDataProvider";
import { useAccount } from "../hooks/useAccount";

function WriteTab() {
  const blockchainState = useBlockchainData();
  const accountData = useAccount();

  return (
    <Formik
      initialValues={{
        token: "dai",
        amount: 0,
        reviewer: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        bearer: "",
        duration: 60,
      }}
      onSubmit={(values, actions) => {
        if (
          blockchainState.cheq !== null &&
          blockchainState.dai !== null &&
          blockchainState.weth !== null
        ) {
          const token =
            values.token == "dai" ? blockchainState.dai : blockchainState.weth;
          const amountWei = ethers.utils.parseEther(values.amount.toString());
          token.functions
            .allowance(blockchainState.account, blockchainState.cheqAddress) // Get user's token approval granted to Cheq
            .then((tokenAllowance) => {
              console.log(tokenAllowance[0], typeof tokenAllowance[0]);
              console.log(amountWei, typeof amountWei);
              // console.log(amountWei.gt(tokenAllowance));
              if (amountWei.gt(tokenAllowance.toNumber())) {
                // User has not approved Cheq enough allowance
                token.functions
                  .approve(blockchainState.cheqAddress, amountWei)
                  .then((success) => {
                    if (success) {
                      console.log(
                        token.address,
                        amountWei,
                        values.duration,
                        values.reviewer,
                        values.bearer
                      );
                      blockchainState.cheq?.depositWrite(
                        token.address,
                        amountWei,
                        values.duration,
                        values.reviewer,
                        values.bearer
                      );
                    } else {
                      alert("Token approval failed");
                    }
                  });
              } else {
                // User has approved enough, write cheq
                console.log(
                  0,
                  token.address,
                  amountWei,
                  values.duration,
                  values.reviewer,
                  values.bearer
                );
                blockchainState.cheq
                  ?.depositWrite(
                    0,
                    token.address,
                    amountWei,
                    values.duration,
                    values.reviewer,
                    values.bearer
                  )
                  .then((cheqID: string) => {
                    alert("Cheq created!: #" + cheqID);
                  });
              }
            });
        }
        setTimeout(() => {
          actions.setSubmitting(false);
        }, 2000);
      }}
    >
      {(props) => (
        <Form>
          <Stack align="flex-start">
            <FormLabel>Merchant Address</FormLabel>
            <Flex gap={10}>
              <AccountField fieldName="bearer" placeholder="0x" />
            </Flex>

            <FormLabel>Auditor Address</FormLabel>
            <Flex>
              <AccountField fieldName="reviewer" placeholder="0x" />
            </Flex>

            <FormLabel>Inspection Period:</FormLabel>
            <Flex gap={10}>
              <DurationField />
            </Flex>

            <FormLabel>Select Currency</FormLabel>
            <Flex gap={10}>
              <TokenField />
            </Flex>

            <FormLabel>Amount</FormLabel>
            <Flex gap={10}>
              <AmountField />
            </Flex>

            <Flex gap={10}>
              <Button mt={4} isLoading={props.isSubmitting} type="submit">
                Send Cheq
              </Button>
            </Flex>
          </Stack>
        </Form>
      )}
    </Formik>
  );
}

export default WriteTab;
