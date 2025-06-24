/**
 * The result and metrics of a successful program execution and proof generation.
 *
 * ## Fields
 *
 * * `returnValue` - The return value of the program
 * * `overallFrequency` - The frequency of the execution and proof generation, in Hz
 * * `executionFrequency` - The frequency of the execution, in Hz
 * * `proofFrequency` - The frequency of the proof generation, in Hz
 * * `proofSize` - The size of the proof, in bytes
 */
export type RunProofResult = {
  returnValue: number;
  overallFrequency: number;
  executionFrequency: number;
  proofFrequency: number;
  proofSize: number;
};
