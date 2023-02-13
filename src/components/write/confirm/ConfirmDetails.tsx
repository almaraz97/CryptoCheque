import { VStack } from "@chakra-ui/react";
import DetailsRow from "../../designSystem/DetailsRow";
import RoundedBox from "../../designSystem/RoundedBox";
import { useStep } from "../../designSystem/stepper/Stepper";

function ConfirmDetails() {
  const { formData } = useStep();
  // TODO: properly show moduloe specific info
  // const maturityDate = useMemo(() => {
  //   const date = new Date();
  //   date.setDate(date.getDate() + Number(formData.inspection) / 86400);
  //   return date.toDateString();
  // }, [formData.inspection]);
  return (
    <RoundedBox p={6}>
      <VStack>
        <DetailsRow title="Client address" value={formData.address} />
        <DetailsRow
          title="Payment Amount"
          value={formData.amount + " " + formData.token}
        />
      </VStack>
    </RoundedBox>
  );
}

export default ConfirmDetails;
