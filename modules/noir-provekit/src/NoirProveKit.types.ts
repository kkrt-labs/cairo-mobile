/**
 * A serializable wrapper for NoirProof that can be safely passed across the FFI boundary
 */
export type NoirProofWrapper = {
  /** The serialized proof data */
  proofData: string;
};

/**
 * The result and metrics of a successful Noir proof generation.
 *
 * ## Fields
 *
 * * `overallDuration` - The total time for witness generation and proof generation, in seconds
 * * `witnessGenerationDuration` - The time for witness generation, in seconds
 * * `proofGenerationDuration` - The time for proof generation, in seconds
 * * `overallFrequency` - The frequency of the overall process, in Hz (based on constraint count)
 * * `witnessGenerationFrequency` - The frequency of witness generation, in Hz (based on constraint count)
 * * `proofGenerationFrequency` - The frequency of proof generation, in Hz (based on constraint count)
 * * `proofSize` - The size of the proof, in bytes
 * * `constraintCount` - The number of constraints in the circuit
 * * `proof` - The proof wrapper containing the serialized proof
 */
export type NoirProofResult = {
  overallDuration: number;
  witnessGenerationDuration: number;
  proofGenerationDuration: number;
  overallFrequency: number;
  witnessGenerationFrequency: number;
  proofGenerationFrequency: number;
  proofSize: number;
  constraintCount: number;
  proof: NoirProofWrapper;
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
