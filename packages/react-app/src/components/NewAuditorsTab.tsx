import React from "react";
import { ethers } from "ethers";
import { Form, Formik } from "formik";
import { Button, Flex, FormLabel } from "@chakra-ui/react";
import type { BlockchainData } from "../hooks/useBlockchainData";

interface Props {
  blockchainState: BlockchainData;
}

function NewAuditorsTab({ blockchainState }: Props) {
  return (
    <Formik
      initialValues={{ token: "dai", amount: 0 }}
      onSubmit={(values, actions) => {
        const weiAmount = ethers.utils.parseEther(values.amount.toString()); // convert to wei
        if (
          blockchainState.cheq !== null &&
          blockchainState.dai !== null &&
          blockchainState.weth !== null
        ) {
          const depositToken =
            values.token == "dai" ? blockchainState.dai : blockchainState.weth;
          depositToken.approve(blockchainState.cheq.address, weiAmount);
          blockchainState.cheq?.functions["deposit(address, uint256)"](
            depositToken,
            weiAmount
          );
        }
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          actions.setSubmitting(false);
        }, 1000);
      }}
    >
      {(props) => (
        <Form>
          <FormLabel>Are you a User or an Auditor?</FormLabel>
          <Flex gap={10}></Flex>
          <Button mt={4} isLoading={props.isSubmitting} type="submit">
            Add Address
          </Button>
        </Form>
      )}
    </Formik>
  );
}

export default NewAuditorsTab;
