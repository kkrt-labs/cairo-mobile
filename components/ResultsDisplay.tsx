import React from "react";
import { SystemType } from "../hooks/types";
import { BaseResultsDisplayProps } from "./BaseResultsDisplay";
import { CairoMResultsDisplay } from "./CairoMResultsDisplay";
import { NoirResultsDisplay } from "./NoirResultsDisplay";

interface ResultsDisplayProps extends BaseResultsDisplayProps {
  systemType: SystemType;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  result,
  showProof,
  showVerification,
  systemType,
}) => {
  switch (systemType) {
    case "cairo-m":
      return (
        <CairoMResultsDisplay
          result={result}
          showProof={showProof}
          showVerification={showVerification}
        />
      );
    case "noir-provekit":
      return (
        <NoirResultsDisplay
          result={result}
          showProof={showProof}
          showVerification={showVerification}
        />
      );
    default:
      return null;
  }
};
