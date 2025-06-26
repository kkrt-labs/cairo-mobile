import { NativeModule, requireNativeModule } from "expo";
import { RunProofResult, VerifyResult } from "./CairoMBindings.types";

declare class CairoMBindingsModule extends NativeModule {
  runAndGenerateProof(
    programJsonStr: string,
    entrypointName: string,
    inputs: number[],
  ): Promise<RunProofResult>;
  verifyProof(proof: string): Promise<VerifyResult>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<CairoMBindingsModule>("CairoMBindings");
