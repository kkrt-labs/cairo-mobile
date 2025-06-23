package expo.modules.cairombindings

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL
import uniffi.cairo_m_runner.runProgram

import expo.modules.kotlin.records.Record
import expo.modules.kotlin.records.Field

// Import the UniFFI-generated RunResult, alias it for clarity
import uniffi.cairo_m_runner.RunResult as UniFFIRunResult

// This is the data class that Expo Modules Kotlin will recognize and marshal.
// It must implement `Record` and its fields should be marked with `@Field`.
data class ExpoRunResult(
    @Field val returnValue: Double,
    @Field val frequency: Double,
) : Record

// Extension functions to easily convert between the two types
fun UniFFIRunResult.toExpoRunResult(): ExpoRunResult {
    return ExpoRunResult(
        returnValue = this.returnValue.toDouble(),
        frequency = this.frequency
    )
}

fun ExpoRunResult.toUniFFIRunResult(): UniFFIRunResult {
    return UniFFIRunResult(
        returnValue = this.returnValue.toUInt(),
        frequency = this.frequency
    )
}

class CairoMBindingsModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('CairoMBindings')` in JavaScript.
    Name("CairoMBindings")

    AsyncFunction("runProgram") { programJsonStr: String ->
      return@AsyncFunction runProgram(programJsonStr).toExpoRunResult()
    }
  }
}
