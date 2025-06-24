import { ProofResult, VerificationResult } from "../ResultsDisplay";

// Format time duration for display
const formatTime = (milliseconds: number): string => {
  if (milliseconds < 1) {
    return `${(milliseconds * 1000).toFixed(1)}μs`;
  } else if (milliseconds < 1000) {
    return `${milliseconds.toFixed(2)}ms`;
  } else {
    return `${(milliseconds / 1000).toFixed(2)}s`;
  }
};

// Format frequency with appropriate unit (Hz, kHz, MHz, GHz)
export const formatFrequency = (frequencyInHz: number): string => {
  if (frequencyInHz >= 1000000000) {
    // GHz range
    const ghz = frequencyInHz / 1000000000;
    return `${ghz.toFixed(ghz >= 10 ? 1 : 2)} GHz`;
  } else if (frequencyInHz >= 1000000) {
    // MHz range
    const mhz = frequencyInHz / 1000000;
    return `${mhz.toFixed(mhz >= 10 ? 1 : 2)} MHz`;
  } else if (frequencyInHz >= 1000) {
    // kHz range
    const khz = frequencyInHz / 1000;
    return `${khz.toFixed(khz >= 10 ? 1 : 2)} kHz`;
  } else {
    // Hz range
    return `${frequencyInHz.toFixed(frequencyInHz >= 10 ? 1 : 2)} Hz`;
  }
};

// Generate dummy proof data (TODO: Replace with actual proof generation)
const generateProofData = (fibTerm: number, result: number): ProofResult => {
  // Simulate proof size and time based on computation complexity
  const complexity = Math.log10(fibTerm + 1);
  const proofSize = (50 + complexity * 20).toFixed(1);
  const provingTime = (100 + complexity * 50 + Math.random() * 100).toFixed(0);

  return {
    proofSize: `${proofSize} KB`,
    provingTime: `${provingTime}ms`,
  };
};

// Generate dummy verification data (TODO: Replace with actual verification)
const generateVerificationData = (result: number): VerificationResult => {
  // Verification is typically much faster than proving
  const verificationTime = (5 + Math.random() * 15).toFixed(1);

  return {
    result: result,
    verificationTime: `${verificationTime}ms`,
  };
};

export const generateFibonacciProof = (
  fibTerm: number,
  result: number,
): ProofResult => {
  // TODO: Replace with actual Cairo-M proof generation
  return generateProofData(fibTerm, result);
};

export const verifyFibonacciProof = (result: number): VerificationResult => {
  // TODO: Replace with actual Cairo-M verification
  return generateVerificationData(result);
};
