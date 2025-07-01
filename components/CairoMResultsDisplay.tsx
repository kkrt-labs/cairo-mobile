import React from "react";
import { formatFrequency, formatTime } from "./utils/computation";
import {
  BaseResultsDisplayProps,
  BaseResultsContainer,
  AccordionSection,
  ResultItem,
  VerificationResults,
  formatProofSize,
  formatSteps,
} from "./BaseResultsDisplay";

export const CairoMResultsDisplay: React.FC<BaseResultsDisplayProps> = ({
  result,
  showProof,
  showVerification,
}) => {
  return (
    <BaseResultsContainer>
      {/* Global Results */}
      <AccordionSection title="Global Results" showSection={showProof}>
        {result.runProofResult.returnValues && (
          <ResultItem
            label="Fibonacci Value"
            value={result.runProofResult.returnValues[0]}
          />
        )}
        {result.runProofResult.numSteps && (
          <ResultItem
            label="Number of Steps"
            value={formatSteps(result.runProofResult.numSteps)}
          />
        )}
        <ResultItem
          label="Execution + Proof Duration"
          value={formatTime(result.runProofResult.overallDuration)}
        />
        {result.runProofResult.overallFrequency && (
          <ResultItem
            label="Execution + Proof Frequency"
            value={formatFrequency(result.runProofResult.overallFrequency)}
          />
        )}
      </AccordionSection>

      {/* Execution Results */}
      <AccordionSection
        title="Execution Results"
        showSection={showProof && !!result.runProofResult.executionDuration}
      >
        <ResultItem
          label="Execution Duration"
          value={formatTime(result.runProofResult.executionDuration!)}
        />
        <ResultItem
          label="Execution Frequency"
          value={formatFrequency(result.runProofResult.executionFrequency!)}
        />
      </AccordionSection>

      {/* Proving Results */}
      <AccordionSection
        title="Proving Results"
        showSection={showProof && !!result.runProofResult.proofDuration}
      >
        <ResultItem
          label="Proof Duration"
          value={formatTime(result.runProofResult.proofDuration!)}
        />
        <ResultItem
          label="Proof Frequency"
          value={formatFrequency(result.runProofResult.proofFrequency!)}
        />
        <ResultItem
          label="Proof Size"
          value={formatProofSize(result.runProofResult.proofSize)}
        />
      </AccordionSection>

      {/* Verification Results */}
      <VerificationResults
        result={result}
        showVerification={showVerification}
      />
    </BaseResultsContainer>
  );
};
