import { NativeModulesProxy, RequireNativeModule } from "expo-modules-core";
import { RunProofResult, VerifyResult } from "./CairoMBindings.types";

declare class CairoMBindingsModule {
  runAndGenerateProof(
    programJsonStr: string,
    entrypointName: string,
    inputs: number[],
  ): Promise<RunProofResult>;
  verifyProof(proof: string): Promise<VerifyResult>;
}

// This call loads the native module object from the JSI.
export default RequireNativeModule<CairoMBindingsModule>("CairoMBindings");
