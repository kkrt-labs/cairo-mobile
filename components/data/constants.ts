import { ProgramOption } from "../ProgramDropdown";
import { SystemType } from "../../hooks/types";

// System definitions
export interface SystemOption {
  type: SystemType;
  label: string;
  available: boolean;
}

export const Systems: SystemOption[] = [
  { type: "cairo-m", label: "Cairo M", available: true },
  { type: "noir-provekit", label: "Noir ProveKit", available: true },
];

// Programs per system
export const SystemPrograms: Record<SystemType, ProgramOption[]> = {
  "cairo-m": [
    { type: "fibonacci", label: "Fibonacci", available: true },
    { type: "hashes", label: "Hashes", available: false },
  ],
  "noir-provekit": [
    { type: "fibonacci", label: "Fibonacci", available: true },
    { type: "hashes", label: "Hashes", available: false },
  ],
};

// For backward compatibility - defaults to Cairo M programs
export const Programs: ProgramOption[] = SystemPrograms["cairo-m"];

// System configurations
export interface SystemConfig {
  circuitPath: string;
  supportsInput: boolean;
  inputPlaceholder?: string;
}

export const SystemConfigurations: Record<SystemType, SystemConfig> = {
  "cairo-m": {
    circuitPath: "../assets/cairo-m/fibonacci_loop.json",
    supportsInput: true,
    inputPlaceholder: "Enter fibonacci term",
  },
  "noir-provekit": {
    circuitPath: "../assets/noir/noir_fib.json",
    supportsInput: false, // Uses empty inputs "{}"
  },
};
