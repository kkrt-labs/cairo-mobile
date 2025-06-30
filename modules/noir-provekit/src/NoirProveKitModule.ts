import { NativeModule, requireNativeModule } from "expo";
import { NoirProofResult, NoirVerifyResult } from "./NoirProveKit.types";

declare class NoirProveKitModule extends NativeModule {
  generateProof(
    circuitJsonStr: string,
    inputJsonStr: string,
  ): Promise<NoirProofResult>;
  verifyProof(circuitJsonStr: string, proof: string): Promise<NoirVerifyResult>;
  generateAndVerifyProof(
    circuitJsonStr: string,
    inputJsonStr: string,
  ): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<NoirProveKitModule>("NoirProveKit");
