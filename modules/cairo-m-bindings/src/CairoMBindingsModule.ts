import { NativeModule, requireNativeModule } from "expo";
import { RunProofResult } from "./CairoMBindings.types";

declare class CairoMBindingsModule extends NativeModule {
  runAndGenerateProof(programJsonStr: string): Promise<RunProofResult>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<CairoMBindingsModule>("CairoMBindings");
