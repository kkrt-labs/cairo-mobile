import React from "react";
import { formatFrequency, formatTime } from "./utils/computation";
import {
  BaseResultsDisplayProps,
  BaseResultsContainer,
  AccordionSection,
  ResultItem,
  JsonResultItem,
  VerificationResults,
  formatProofSize,
  formatSteps,
} from "./BaseResultsDisplay";

export const NoirResultsDisplay: React.FC<BaseResultsDisplayProps> = ({
  result,
  showProof,
  showVerification,
}) => {
  return (
    <BaseResultsContainer>
      {/* Global Results */}
      <AccordionSection title="Global Results" showSection={showProof}>
        {result.runProofResult.returnValue && (
          <JsonResultItem
            label="Fibonacci Value"
            value={result.runProofResult.returnValue}
          />
        )}
        {result.runProofResult.constraintCount && (
          <ResultItem
            label="Constraint Count"
            value={formatSteps(result.runProofResult.constraintCount)}
          />
        )}
        <ResultItem
          label="Global Duration"
          value={formatTime(result.runProofResult.overallDuration)}
        />
        {result.runProofResult.overallFrequency && (
          <ResultItem
            label="Global Frequency"
            value={formatFrequency(result.runProofResult.overallFrequency)}
          />
        )}
      </AccordionSection>

      {/* Witness Generation Results */}
      <AccordionSection
        title="Witness Generation Results"
        showSection={
          showProof && !!result.runProofResult.witnessGenerationDuration
        }
      >
        <ResultItem
          label="Witness Generation Duration"
          value={formatTime(result.runProofResult.witnessGenerationDuration!)}
        />
        {result.runProofResult.witnessGenerationFrequency && (
          <ResultItem
            label="Witness Generation Frequency"
            value={formatFrequency(
              result.runProofResult.witnessGenerationFrequency,
            )}
          />
        )}
      </AccordionSection>

      {/* Proving Results */}
      <AccordionSection
        title="Proving Results"
        showSection={
          showProof && !!result.runProofResult.proofGenerationDuration
        }
      >
        <ResultItem
          label="Proof Duration"
          value={formatTime(result.runProofResult.proofGenerationDuration!)}
        />
        {result.runProofResult.proofGenerationFrequency && (
          <ResultItem
            label="Proof Frequency"
            value={formatFrequency(
              result.runProofResult.proofGenerationFrequency,
            )}
          />
        )}
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
