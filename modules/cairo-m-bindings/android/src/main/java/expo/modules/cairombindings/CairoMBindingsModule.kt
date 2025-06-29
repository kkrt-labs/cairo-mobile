package expo.modules.cairombindings

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import uniffi.cairo_m_bindings.runAndGenerateProof
import uniffi.cairo_m_bindings.verifyProof

import expo.modules.kotlin.records.Record
import expo.modules.kotlin.records.Field

// Import the UniFFI-generated RunProofResult, alias it for clarity
import uniffi.cairo_m_bindings.RunProofResult as UniFFIRunProofResult
import uniffi.cairo_m_bindings.VerifyResult as UniFFIVerifyResult

// This is the data class that Expo Modules Kotlin will recognize and marshal.
// It must implement `Record` and its fields should be marked with `@Field`.
data class ExpoRunProofResult(
    @Field val returnValues: List<Double>,
    @Field val numSteps: Double,
    @Field val overallDuration: Double,
    @Field val executionDuration: Double,
    @Field val proofDuration: Double,
    @Field val overallFrequency: Double,
    @Field val executionFrequency: Double,
    @Field val proofFrequency: Double,
    @Field val proofSize: Double,
    @Field val proof: String,
) : Record

data class ExpoVerifyResult(
    @Field val verificationTime: Double,
) : Record

// Extension functions to easily convert between the UniFFI and Expo types
fun UniFFIRunProofResult.toExpoRunProofResult(): ExpoRunProofResult =
    ExpoRunProofResult(
        returnValues = this.returnValues.map { it.toDouble() },
        numSteps = this.numSteps.toDouble(),
        overallDuration = this.overallDuration,
        executionDuration = this.executionDuration,
        proofDuration = this.proofDuration,
        overallFrequency = this.overallFrequency,
        executionFrequency = this.executionFrequency,
        proofFrequency = this.proofFrequency,
        proofSize = this.proofSize.toDouble(),
        proof = this.proof,
    )

fun UniFFIVerifyResult.toExpoVerifyResult(): ExpoVerifyResult =
    ExpoVerifyResult(
        verificationTime = this.verificationTime.toDouble(),
    )

class CairoMBindingsModule : Module() {
    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    override fun definition() =
        ModuleDefinition {
            // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
            // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
            // The module will be accessible from `requireNativeModule('CairoMBindings')` in JavaScript.
            Name("CairoMBindings")

            AsyncFunction("runAndGenerateProof") { programJsonStr: String, entrypointName: String, inputs: List<Double> ->
                val inputsAsUInt = inputs.map { it.toUInt() }
                return@AsyncFunction runAndGenerateProof(programJsonStr, entrypointName, inputsAsUInt).toExpoRunProofResult()
            }

            AsyncFunction("verifyProof") { proof: String ->
                return@AsyncFunction verifyProof(proof).toExpoVerifyResult()
            }
        }
}
