/**
 * The result and metrics of a successful Noir proof generation.
 *
 * ## Fields
 *
 * * `returnValue` - The return value of the circuit execution as a JSON string
 * * `overallDuration` - The total time for witness generation and proof generation, in seconds
 * * `witnessGenerationDuration` - The time for witness generation, in seconds
 * * `proofGenerationDuration` - The time for proof generation, in seconds
 * * `overallFrequency` - The frequency of the overall process, in Hz (based on constraint count)
 * * `witnessGenerationFrequency` - The frequency of witness generation, in Hz (based on constraint count)
 * * `proofGenerationFrequency` - The frequency of proof generation, in Hz (based on constraint count)
 * * `proofSize` - The size of the proof, in bytes
 * * `constraintCount` - The number of constraints in the circuit
 * * `proof` - The proof as a serialized string
 */
export type NoirProofResult = {
  returnValue: string;
  overallDuration: number;
  witnessGenerationDuration: number;
  proofGenerationDuration: number;
  overallFrequency: number;
  witnessGenerationFrequency: number;
  proofGenerationFrequency: number;
  proofSize: number;
  constraintCount: number;
  proof: string;
};

/**
 * The result and metrics of a successful Noir proof verification.
 *
 * ## Fields
 *
 * * `verificationDuration` - The time for verification, in seconds
 */
export type NoirVerifyResult = {
  verificationDuration: number;
};
