/**
 * The result and metrics of a successful program execution and proof generation.
 *
 * ## Fields
 *
 * * `returnValues` - The return values of the program
 * * `overallFrequency` - The frequency of the execution and proof generation, in Hz
 * * `executionFrequency` - The frequency of the execution, in Hz
 * * `proofFrequency` - The frequency of the proof generation, in Hz
 * * `proofSize` - The size of the proof, in bytes
 * * `proof` - The proof of the program
 */
export type RunProofResult = {
  returnValues: number[];
  overallFrequency: number;
  executionFrequency: number;
  proofFrequency: number;
  proofSize: number;
  proof: string;
};

export type VerifyResult = {
  verificationTime: number;
};
