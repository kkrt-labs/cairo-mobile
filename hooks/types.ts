import { Program } from "../components/ProgramDropdown";
import { ComputationResult } from "../components/ResultsDisplay";

// Types
export type MutationType = "run" | "proof" | "verify";

export interface AppState {
  inputValue: string;
  selectedProgram: Program;
  lastMutation: MutationType | null;
  computationResult: ComputationResult | null;
}
