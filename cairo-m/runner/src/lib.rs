uniffi::setup_scaffolding!();

use cairo_m_common::Program;
use cairo_m_prover::{
    adapter::import_from_runner_output, prover::prove_cairo_m, verifier::verify_cairo_m,
};
use cairo_m_runner::run_cairo_program;
use stwo_prover::core::{fields::m31::M31, vcs::blake2_merkle::Blake2sMerkleChannel};

/// Represents the possible errors that can occur in the mobile VM.
#[derive(Debug, thiserror::Error, uniffi::Error)]
pub enum MobileError {
    #[error("JSON parsing error: {0}")]
    Json(String),
    #[error("VM Error: {0}")]
    Vm(String),
    #[error("Adapter error: {0}")]
    Adapter(String),
    #[error("Proof generation error: {0}")]
    Proof(String),
    #[error("Verification error: {0}")]
    Verification(String),
}

/// The result and metrics of a successful program execution and proof generation.
///
/// # Fields
///
/// * `return_values` - The return values of the program
/// * `overall_frequency` - The frequency of the execution and proof generation, in Hz
/// * `execution_frequency` - The frequency of the execution, in Hz
/// * `proof_frequency` - The frequency of the proof generation, in Hz
/// * `proof_size` - The size of the proof, in bytes
/// * `proof` - The proof of the program, serialized as a JSON string
#[derive(Debug, uniffi::Record)]
pub struct RunProofResult {
    pub return_values: Vec<u32>,
    pub overall_frequency: f64,
    pub execution_frequency: f64,
    pub proof_frequency: f64,
    pub proof_size: u32,
    pub proof: String,
}

#[derive(Debug, uniffi::Record)]
pub struct VerifyResult {
    pub verification_time: f64,
}

/// Runs a compiled Cairo program and generate a proof of execution.
/// It returns the result, execution metrics and the proof generated.
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
fn run_and_generate_proof(
    program_json_str: String,
    entrypoint_name: String,
    inputs: Vec<u32>,
) -> Result<RunProofResult, MobileError> {
    let overall_start = std::time::Instant::now();

    // Program Execution - Trace Generation

    let compiled_program: Program =
        sonic_rs::from_str(&program_json_str).map_err(|e| MobileError::Json(e.to_string()))?;

    let entrypoint = compiled_program
        .get_entrypoint(&entrypoint_name)
        .ok_or_else(|| MobileError::Vm(format!("Entrypoint {} not found", entrypoint_name)))?;

    let runner_inputs: Vec<M31> = inputs
        .iter()
        .take(entrypoint.args.len())
        .map(|&value| M31::from(value))
        .collect();

    let runner_output = run_cairo_program(
        &compiled_program,
        entrypoint_name.as_str(),
        &runner_inputs,
        Default::default(),
    )
    .map_err(|e| MobileError::Vm(e.to_string()))?;

    let execution_duration = overall_start.elapsed();

    // Proof Generation

    let proof_start = std::time::Instant::now();
    let mut prover_input = import_from_runner_output(&runner_output)
        .map_err(|e| MobileError::Adapter(e.to_string()))?;
    let proof = prove_cairo_m::<Blake2sMerkleChannel>(&mut prover_input)
        .map_err(|e| MobileError::Proof(e.to_string()))?;

    let proof_duration = proof_start.elapsed();
    let overall_duration = overall_start.elapsed();

    // Return values
    let return_values = runner_output
        .return_values
        .iter()
        .map(|value| value.0)
        .collect();

    // Metrics Computation

    let num_steps = runner_output.vm.trace.len() as f64;
    println!("num_steps: {}", num_steps);
    let execution_frequency = num_steps / execution_duration.as_secs_f64();
    let proof_frequency = num_steps / proof_duration.as_secs_f64();
    let overall_frequency = num_steps / overall_duration.as_secs_f64();

    let proof_size = proof.stark_proof.size_estimate() as u32;
    let proof_json = sonic_rs::to_string(&proof).map_err(|e| MobileError::Json(e.to_string()))?;

    Ok(RunProofResult {
        return_values,
        overall_frequency,
        execution_frequency,
        proof_frequency,
        proof_size,
        proof: proof_json,
    })
}

#[uniffi::export]
fn verify_proof(proof: String) -> Result<VerifyResult, MobileError> {
    let verification_start = std::time::Instant::now();

    let proof = sonic_rs::from_str(&proof).map_err(|e| MobileError::Json(e.to_string()))?;
    verify_cairo_m::<Blake2sMerkleChannel>(proof)
        .map_err(|e| MobileError::Verification(e.to_string()))?;

    Ok(VerifyResult {
        verification_time: verification_start.elapsed().as_secs_f64(),
    })
}

#[cfg(test)]
mod tests {
    use std::fs;

    use super::*;

    #[test]
    fn test_fibonacci_program() -> Result<(), MobileError> {
        let file_content = fs::read_to_string("test_data/fibonacci_loop.json").unwrap();
        let result =
            run_and_generate_proof(file_content, "fibonacci_loop".to_string(), vec![116_507])
                .unwrap();
        assert_eq!(result.return_values.len(), 1);
        assert_eq!(result.return_values[0], 394756528);
        // verify_proof(result.proof)?;
        Ok(())
    }
}
