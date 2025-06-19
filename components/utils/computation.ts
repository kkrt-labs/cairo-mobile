import {
  ComputationResult,
  RunResult,
  ProofResult,
  VerificationResult,
} from "../ResultsDisplay";

// Efficient fibonacci computation using iterative approach
const computeFibonacci = (n: number): number => {
  if (n <= 0) return 0;
  if (n === 1) return 1;

  let a = 0;
  let b = 1;

  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }

  return b;
};

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
const formatFrequency = (frequencyInMHz: number): string => {
  if (frequencyInMHz >= 1000) {
    // GHz range
    const ghz = frequencyInMHz / 1000;
    return `${ghz.toFixed(ghz >= 10 ? 1 : 2)} GHz`;
  } else if (frequencyInMHz >= 1) {
    // MHz range
    return `${frequencyInMHz.toFixed(frequencyInMHz >= 10 ? 1 : 2)} MHz`;
  } else if (frequencyInMHz >= 0.001) {
    // kHz range
    const khz = frequencyInMHz * 1000;
    return `${khz.toFixed(khz >= 10 ? 1 : 2)} kHz`;
  } else {
    // Hz range
    const hz = frequencyInMHz * 1000000;
    return `${hz.toFixed(hz >= 10 ? 1 : 2)} Hz`;
  }
};

// Simulate trace generation speed based on computation complexity
const calculateTraceSpeed = (
  fibTerm: number,
  executionTime: number,
): string => {
  // Simulate MHz based on operations per second
  // Higher fibonacci terms require more operations, affecting trace generation
  const baseSpeed = 2400; // Base MHz
  const complexityFactor = Math.max(1, Math.log10(fibTerm + 1));
  const timeFactor = Math.max(0.1, executionTime);

  const adjustedSpeed =
    baseSpeed / (complexityFactor * Math.log(timeFactor + 1));
  return formatFrequency(adjustedSpeed);
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

export const getFibonacciRunResult = (fibTerm: number): RunResult => {
  // Measure computation time
  const startTime = performance.now();
  const result = computeFibonacci(fibTerm);
  const endTime = performance.now();

  const executionTime = endTime - startTime;

  // Generate run results
  return {
    result: result,
    traceGenerationSpeed: calculateTraceSpeed(fibTerm, executionTime),
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
