package expo.modules.noirprovekit

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import uniffi.noir_provekit.generateProof
import uniffi.noir_provekit.verifyProof
import uniffi.noir_provekit.generateAndVerifyProof

import expo.modules.kotlin.records.Record
import expo.modules.kotlin.records.Field

// Import the UniFFI-generated types, alias them for clarity
import uniffi.noir_provekit.NoirProofResult as UniFFINoirProofResult
import uniffi.noir_provekit.NoirVerifyResult as UniFFINoirVerifyResult
import uniffi.noir_provekit.NoirProofWrapper as UniFFINoirProofWrapper

// This is the data class that Expo Modules Kotlin will recognize and marshal.
// It must implement `Record` and its fields should be marked with `@Field`.
data class ExpoNoirProofWrapper(
    @Field val proofData: String,
) : Record

data class ExpoNoirProofResult(
    @Field val overallDuration: Double,
    @Field val witnessGenerationDuration: Double,
    @Field val proofGenerationDuration: Double,
    @Field val overallFrequency: Double,
    @Field val witnessGenerationFrequency: Double,
    @Field val proofGenerationFrequency: Double,
    @Field val proofSize: Double,
    @Field val constraintCount: Double,
    @Field val proof: ExpoNoirProofWrapper,
) : Record

data class ExpoNoirVerifyResult(
    @Field val verificationDuration: Double,
) : Record

// Extension functions to easily convert between the UniFFI and Expo types
fun UniFFINoirProofResult.toExpoNoirProofResult(): ExpoNoirProofResult =
    ExpoNoirProofResult(
        overallDuration = this.overallDuration,
        witnessGenerationDuration = this.witnessGenerationDuration,
        proofGenerationDuration = this.proofGenerationDuration,
        overallFrequency = this.overallFrequency,
        witnessGenerationFrequency = this.witnessGenerationFrequency,
        proofGenerationFrequency = this.proofGenerationFrequency,
        proofSize = this.proofSize.toDouble(),
        constraintCount = this.constraintCount.toDouble(),
        proof = ExpoNoirProofWrapper(proofData = this.proof.proofData),
    )

fun UniFFINoirVerifyResult.toExpoNoirVerifyResult(): ExpoNoirVerifyResult =
    ExpoNoirVerifyResult(
        verificationDuration = this.verificationDuration,
    )

fun ExpoNoirProofWrapper.toUniFFINoirProofWrapper(): UniFFINoirProofWrapper = UniFFINoirProofWrapper(proofData = this.proofData)

class NoirProveKitModule : Module() {
    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    override fun definition() =
        ModuleDefinition {
            // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
            // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
            // The module will be accessible from `requireNativeModule('NoirProveKit')` in JavaScript.
            Name("NoirProveKit")

            AsyncFunction("generateProof") { circuitJsonStr: String, inputJsonStr: String ->
                return@AsyncFunction generateProof(circuitJsonStr, inputJsonStr).toExpoNoirProofResult()
            }

            AsyncFunction("verifyProof") { circuitJsonStr: String, proof: ExpoNoirProofWrapper ->
                return@AsyncFunction verifyProof(circuitJsonStr, proof.toUniFFINoirProofWrapper()).toExpoNoirVerifyResult()
            }

            AsyncFunction("generateAndVerifyProof") { circuitJsonStr: String, inputJsonStr: String ->
                generateAndVerifyProof(circuitJsonStr, inputJsonStr)
            }
        }
}
