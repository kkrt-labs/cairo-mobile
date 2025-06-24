import { Program } from "../components/ProgramDropdown";
import {
  RunProofResult,
  VerifyResult,
} from "../modules/cairo-m-bindings/src/CairoMBindings.types";

// Types
export type MutationType = "generateProof" | "verify";

export interface ComputationResult {
  runProofResult: RunProofResult;
  verifyResult?: VerifyResult;
}

export interface AppState {
  inputValue: string;
  selectedProgram: Program;
  lastMutation: MutationType | null;
  computationResult: ComputationResult | null;
}
