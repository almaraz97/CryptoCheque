import { Box } from "@chakra-ui/react";
import { useMemo } from "react";
import { DirectPayTerms } from "./DirectPayTerms";
import { EscrowTerms } from "./EscrowTerms";
import { MilestoneTerms } from "./MilestoneTerms";
import { MotionBox } from "./MotionBox";

interface Props {
  module: string;
  isInvoice: boolean;
}

function ModuleTerms({ module, isInvoice }: Props) {
  const selectedModule = useMemo(() => {
    switch (module) {
      case "direct":
        return <DirectPayTerms isInvoice={isInvoice} />;
      case "escrow":
        return <EscrowTerms />;
      case "milestone":
        return <MilestoneTerms />;
      default:
        return <DirectPayTerms isInvoice={isInvoice} />;
    }
  }, [isInvoice, module]);

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      mb={4}
    >
      <Box padding={6}>{selectedModule}</Box>
    </MotionBox>
  );
}

export default ModuleTerms;
