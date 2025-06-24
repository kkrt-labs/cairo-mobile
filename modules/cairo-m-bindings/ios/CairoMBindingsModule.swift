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

    AsyncFunction("runAndGenerateProof") { (programJsonStr: String) -> [String: Any] in
      do {
        let result = try runProgram(programJsonStr: programJsonStr)
        return [
          "returnValue": result.returnValue,
          "overallFrequency": result.overallFrequency,
          "executionFrequency": result.executionFrequency,
          "proofFrequency": result.proofFrequency,
          "proofSize": result.proofSize
        ]
      } catch {
        throw NSError(
          domain: "CairoMBindings",
          code: 1,
          userInfo: [
            NSLocalizedDescriptionKey: "Failed to run program: \(error.localizedDescription)"
          ],
        )
      }
    }
  }
}
