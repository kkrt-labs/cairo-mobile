import { NativeModule, requireNativeModule } from "expo";
import { RunResult } from "./CairoMBindings.types";

declare class CairoMBindingsModule extends NativeModule {
  runProgram(programJsonStr: string): Promise<RunResult>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<CairoMBindingsModule>("CairoMBindings");
