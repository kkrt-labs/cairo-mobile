import { Program } from "../components/ProgramDropdown";
import {
  RunProofResult,
  VerifyResult,
} from "../modules/cairo-m-bindings/src/CairoMBindings.types";
import { SharedProofData } from "../components/utils/proofSharing";

// Types
export type MutationType = "generateProof" | "verify" | "importProof";

export interface ComputationResult {
  runProofResult: RunProofResult;
  verifyResult?: VerifyResult;
  isImported?: boolean;
  sharedData?: SharedProofData;
}

export interface AppState {
  inputValue: string;
  selectedProgram: Program;
  lastMutation: MutationType | null;
  computationResult: ComputationResult | null;
}
