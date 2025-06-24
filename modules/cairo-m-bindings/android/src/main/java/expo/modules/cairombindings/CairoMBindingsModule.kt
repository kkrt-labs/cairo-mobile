package expo.modules.cairombindings

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import uniffi.cairo_m_bindings.runAndGenerateProof

import expo.modules.kotlin.records.Record
import expo.modules.kotlin.records.Field

// Import the UniFFI-generated RunProofResult, alias it for clarity
import uniffi.cairo_m_bindings.RunProofResult as UniFFIRunProofResult

// This is the data class that Expo Modules Kotlin will recognize and marshal.
// It must implement `Record` and its fields should be marked with `@Field`.
data class ExpoRunProofResult(
    @Field val returnValue: Double,
    @Field val overallFrequency: Double,
    @Field val executionFrequency: Double,
    @Field val proofFrequency: Double,
    @Field val proofSize: Double,
) : Record

// Extension functions to easily convert between the UniFFI and Expo types
fun UniFFIRunProofResult.toExpoRunProofResult(): ExpoRunProofResult =
    ExpoRunProofResult(
        returnValue = this.returnValue.toDouble(),
        overallFrequency = this.overallFrequency,
        executionFrequency = this.executionFrequency,
        proofFrequency = this.proofFrequency,
        proofSize = this.proofSize.toDouble(),
    )

fun ExpoRunProofResult.toUniFFIRunProofResult(): UniFFIRunProofResult =
    UniFFIRunProofResult(
        returnValue = this.returnValue.toUInt(),
        overallFrequency = this.overallFrequency,
        executionFrequency = this.executionFrequency,
        proofFrequency = this.proofFrequency,
        proofSize = this.proofSize.toUInt(),
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

            AsyncFunction("runAndGenerateProof") { programJsonStr: String ->
                return@AsyncFunction runAndGenerateProof(programJsonStr).toExpoRunProofResult()
            }
        }
}
