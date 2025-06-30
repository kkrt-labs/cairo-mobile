import { Program } from "../components/ProgramDropdown";
import {
  RunProofResult,
  VerifyResult,
} from "../modules/cairo-m-bindings/src/CairoMBindings.types";
import {
  NoirProofResult,
  NoirVerifyResult,
} from "../modules/noir-provekit/src/NoirProveKit.types";

// System types
export type SystemType = "cairo-m" | "noir-provekit";

// Types
export type MutationType = "generateProof" | "verify";

// Unified result types that can handle both systems
export interface UnifiedProofResult {
  // Common fields
  overallDuration: number;
  proofSize: number;
  proof: string;

  // Return values (both systems support this)
  returnValues?: number[]; // Cairo M uses number array for fibonacci result
  returnValue?: string; // Noir uses JSON string

  // Cairo M specific (optional)
  numSteps?: number;
  executionDuration?: number;
  proofDuration?: number;
  overallFrequency?: number;
  executionFrequency?: number;
  proofFrequency?: number;

  // Noir specific (optional)
  witnessGenerationDuration?: number;
  proofGenerationDuration?: number;
  witnessGenerationFrequency?: number;
  proofGenerationFrequency?: number;
  constraintCount?: number;
}

export interface UnifiedVerifyResult {
  verificationDuration: number;
}

export interface ComputationResult {
  runProofResult: UnifiedProofResult;
  verifyResult?: UnifiedVerifyResult;
}

export interface AppState {
  inputValue: string;
  selectedProgram: Program;
  selectedSystem: SystemType;
  lastMutation: MutationType | null;
  computationResult: ComputationResult | null;
}

// Helper functions to convert between types
export const convertCairoMResult = (
  result: RunProofResult,
): UnifiedProofResult => ({
  overallDuration: result.overallDuration,
  proofSize: result.proofSize,
  proof: result.proof,
  returnValues: result.returnValues,
  numSteps: result.numSteps,
  executionDuration: result.executionDuration,
  proofDuration: result.proofDuration,
  overallFrequency: result.overallFrequency,
  executionFrequency: result.executionFrequency,
  proofFrequency: result.proofFrequency,
});

export const convertNoirResult = (
  result: NoirProofResult,
): UnifiedProofResult => ({
  overallDuration: result.overallDuration,
  proofSize: result.proofSize,
  proof: result.proof,
  returnValue: result.returnValue,
  witnessGenerationDuration: result.witnessGenerationDuration,
  proofGenerationDuration: result.proofGenerationDuration,
  witnessGenerationFrequency: result.witnessGenerationFrequency,
  proofGenerationFrequency: result.proofGenerationFrequency,
  constraintCount: result.constraintCount,
});

export const convertVerifyResult = (
  result: VerifyResult | NoirVerifyResult,
): UnifiedVerifyResult => ({
  verificationDuration: result.verificationDuration,
});
