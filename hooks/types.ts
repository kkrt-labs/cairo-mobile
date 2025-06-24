import { Program } from "../components/ProgramDropdown";
import { RunProofResult } from "../modules/cairo-m-bindings/src/CairoMBindings.types";

// Types
export type MutationType = "generateProof" | "verify";

export interface VerificationResult {
  result: number;
  verificationTime: string;
}

export interface ComputationResult {
  runAndProof: RunProofResult;
  verification?: VerificationResult;
}

export interface AppState {
  inputValue: string;
  selectedProgram: Program;
  lastMutation: MutationType | null;
  computationResult: ComputationResult | null;
}
