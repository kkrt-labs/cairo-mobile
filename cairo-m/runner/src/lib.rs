uniffi::setup_scaffolding!();

use cairo_m_common::Program;
use cairo_m_prover::prover::prove_cairo_m;
use cairo_m_runner::run_cairo_program;
// use cairo_m_prover::verifier::verify_cairo_m;
use stwo_prover::core::vcs::blake2_merkle::Blake2sMerkleChannel;

/// Represents the possible errors that can occur in the mobile VM.
#[derive(Debug, thiserror::Error, uniffi::Error)]
pub enum MobileError {
    #[error("JSON parsing error: {0}")]
    Json(String),
    #[error("VM Error: {0}")]
    Vm(String),
    #[error("Proof generation error: {0}")]
    Proof(String),
}

/// The result and metrics of a successful program execution and proof generation.
///
/// # Fields
///
/// * `return_value` - The return value of the program
/// * `overall_frequency` - The frequency of the execution and proof generation, in Hz
/// * `execution_frequency` - The frequency of the execution, in Hz
/// * `proof_frequency` - The frequency of the proof generation, in Hz
/// * `proof_size` - The size of the proof, in bytes
#[derive(Debug, uniffi::Record)]
pub struct RunProofResult {
    pub return_value: u32,
    pub overall_frequency: f64,
    pub execution_frequency: f64,
    pub proof_frequency: f64,
    pub proof_size: u32,
}

/// Runs a compiled Cairo program and returns the result and execution metrics.
///
/// This function takes the JSON content of a compiled Cairo program,
/// executes it, generates a proof, and measures performance.
///
/// ## Parameters
///
/// * `program_json_str` - JSON string containing the compiled Cairo program
///
/// ## Returns
///
/// Returns `RunProofResult` containing the program's return value and performance metrics
/// including execution time, proof generation time, and frequency based on the number of instruction steps.
///
/// ## Errors
///
/// Returns a `MobileError` if JSON parsing, VM execution, or proof generation fails.
#[uniffi::export]
fn run_and_generate_proof(program_json_str: String) -> Result<RunProofResult, MobileError> {
    let overall_start = std::time::Instant::now();
    // ┌───────────────────────────────────────────────┐
    // │      Program Execution - Trace Generation     │
    // └───────────────────────────────────────────────┘
    let compiled_program: Program =
        sonic_rs::from_str(&program_json_str).map_err(|e| MobileError::Json(e.to_string()))?;

    let output = run_cairo_program(&compiled_program, "main", Default::default())
        .map_err(|e| MobileError::Vm(e.to_string()))?;

    let execution_duration = overall_start.elapsed();

    // ┌───────────────────────────────────────────────┐
    // │               Proof Generation                │
    // └───────────────────────────────────────────────┘
    let proof_start = std::time::Instant::now();
    let proof = prove_cairo_m::<Blake2sMerkleChannel, 3>(13)
        .map_err(|e| MobileError::Proof(e.to_string()))?;

    // ┌───────────────────────────────────────────────┐
    // │               Metrics Computation             │
    // └───────────────────────────────────────────────┘
    let proof_duration = proof_start.elapsed();
    let overall_duration = overall_start.elapsed();

    let num_steps = output.vm.trace.len() as f64;
    let overall_frequency = num_steps / overall_duration.as_secs_f64();
    let execution_frequency = num_steps / execution_duration.as_secs_f64();
    let proof_frequency = num_steps / proof_duration.as_secs_f64();

    let proof_size = proof.stark_proof.size_estimate() as u32;

    Ok(RunProofResult {
        return_value: output.return_value,
        overall_frequency,
        execution_frequency,
        proof_frequency,
        proof_size,
    })
}

#[cfg(test)]
mod tests {
    use std::fs;

    use super::*;

    #[test]
    fn test_fibonacci_program() {
        let file_content = fs::read_to_string("test_data/fibonacci.json").unwrap();
        let result = run_and_generate_proof(file_content).unwrap();
        assert_eq!(result.return_value, 55);
    }
}
