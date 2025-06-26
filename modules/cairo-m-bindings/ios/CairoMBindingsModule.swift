import ExpoModulesCore

public class CairoMBindingsModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('CairoMBindings')` in JavaScript.
    Name("CairoMBindings")

    AsyncFunction("runAndGenerateProof") { (programJsonStr: String, entrypointName: String, inputs: [Double]) -> [String: Any] in
      do {
        let inputsAsUInt32 = inputs.map { UInt32($0) }
        let result = try runAndGenerateProof(programJsonStr: programJsonStr, entrypointName: entrypointName, inputs: inputsAsUInt32)
        return [
          "returnValues": result.returnValues.map { Double($0) },
          "overallFrequency": result.overallFrequency,
          "executionFrequency": result.executionFrequency,
          "proofFrequency": result.proofFrequency,
          "proofSize": result.proofSize,
          "proof": result.proof
        ]
      } catch {
        throw NSError(
          domain: "CairoMBindings",
          code: 1,
          userInfo: [
            NSLocalizedDescriptionKey: "Failed to run program: \(error.localizedDescription)"
          ]
        )
      }
    }

    AsyncFunction("verifyProof") { (proof: String) -> [String: Any] in
      do {
        let result = try verifyProof(proof: proof)
        return ["verificationTime": result.verificationTime]
      }
    }
  }
}
