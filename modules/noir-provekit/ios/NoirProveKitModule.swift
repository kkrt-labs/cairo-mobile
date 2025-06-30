import ExpoModulesCore

public class NoirProveKitModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('NoirProveKit')` in JavaScript.
    Name("NoirProveKit")

    AsyncFunction("generateProof") { (circuitJsonStr: String, inputJsonStr: String) -> [String: Any] in
      do {
        let result = try generateProof(circuitJsonStr: circuitJsonStr, inputJsonStr: inputJsonStr)
        return [
          "overallDuration": result.overallDuration,
          "witnessGenerationDuration": result.witnessGenerationDuration,
          "proofGenerationDuration": result.proofGenerationDuration,
          "overallFrequency": result.overallFrequency,
          "witnessGenerationFrequency": result.witnessGenerationFrequency,
          "proofGenerationFrequency": result.proofGenerationFrequency,
          "proofSize": result.proofSize,
          "constraintCount": result.constraintCount,
          "proof": [
            "proofData": result.proof.proofData
          ]
        ]
      } catch {
        throw NSError(
          domain: "NoirProveKit",
          code: 1,
          userInfo: [
            NSLocalizedDescriptionKey: "Failed to generate proof: \(error.localizedDescription)"
          ]
        )
      }
    }

    AsyncFunction("verifyProof") { (circuitJsonStr: String, proof: [String: String]) -> [String: Any] in
      do {
        guard let proofData = proof["proofData"] else {
          throw NSError(
            domain: "NoirProveKit",
            code: 2,
            userInfo: [NSLocalizedDescriptionKey: "Invalid proof format"]
          )
        }

        let proofWrapper = NoirProofWrapper(proofData: proofData)
        let result = try verifyProof(circuitJsonStr: circuitJsonStr, proof: proofWrapper)
        return ["verificationDuration": result.verificationDuration]
      } catch {
        throw NSError(
          domain: "NoirProveKit",
          code: 3,
          userInfo: [
            NSLocalizedDescriptionKey: "Failed to verify proof: \(error.localizedDescription)"
          ]
        )
      }
    }

    AsyncFunction("generateAndVerifyProof") { (circuitJsonStr: String, inputJsonStr: String) -> Void in
      do {
        try generateAndVerifyProof(circuitJsonStr: circuitJsonStr, inputJsonStr: inputJsonStr)
      } catch {
        throw NSError(
          domain: "NoirProveKit",
          code: 4,
          userInfo: [
            NSLocalizedDescriptionKey: "Failed to generate and verify proof: \(error.localizedDescription)"
          ]
        )
      }
    }
  }
}
