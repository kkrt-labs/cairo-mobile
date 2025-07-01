uniffi::setup_scaffolding!();

use acvm::FieldElement;
use bn254_blackbox_solver::Bn254BlackBoxSolver;
use nargo::{foreign_calls::DefaultForeignCallBuilder, ops::execute_program};
use noir_r1cs::NoirProofScheme;
use noirc_abi::{
    input_parser::{Format, InputValue},
    InputMap, MAIN_RETURN_NAME,
};
use noirc_artifacts::program::ProgramArtifact;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// Errors to wrap ProveKit errors for UniFFI.
#[derive(Debug, thiserror::Error, uniffi::Error)]
pub enum NoirProverError {
    /// Error when instantiating a Noir prover with a given compiled Noir circuit.
    #[error("Failed to create prover: {0}")]
    CreationError(String),
    /// Something whent wrong during the ProveKit proof generation.
    #[error("Failed to generate proof: {0}")]
    ProofGenerationError(String),
    /// The verification of the given Noir proof failed.
    #[error("Failed to verify proof: {0}")]
    VerificationError(String),
    /// Something went wrong during the return value serialization.
    #[error("Failed to serialize return value: {0}")]
    ReturnValueError(String),
}

/// The result and metrics of a successful Noir proof generation.
///
/// # Fields
///
/// * `overall_duration` - The total time for witness generation and proof generation, in seconds
/// * `witness_generation_duration` - The time for witness generation, in seconds
/// * `proof_generation_duration` - The time for proof generation, in seconds
/// * `overall_frequency` - The frequency of the overall process, in Hz (based on constraint count)
/// * `witness_generation_frequency` - The frequency of witness generation, in Hz (based on
///   constraint count)
/// * `proof_generation_frequency` - The frequency of proof generation, in Hz (based on constraint
///   count)
/// * `proof_size` - The size of the proof, in bytes
/// * `constraint_count` - The number of constraints in the circuit
/// * `proof` - The proof wrapper containing the serialized proof
#[derive(Debug, uniffi::Record)]
pub struct NoirProofResult {
    pub return_value: String,
    pub constraint_count: u32,
    pub overall_duration: f64,
    pub witness_generation_duration: f64,
    pub proof_generation_duration: f64,
    pub overall_frequency: f64,
    pub witness_generation_frequency: f64,
    pub proof_generation_frequency: f64,
    pub proof_size: u32,
    pub proof: String,
}

/// The result and metrics of a successful Noir proof verification.
///
/// # Fields
///
/// * `verification_duration` - The time for verification, in seconds
#[derive(Debug, uniffi::Record)]
pub struct NoirVerifyResult {
    pub verification_duration: f64,
}

/// Object to generate a proof of a Noir circuit with ProveKit.
#[derive(Serialize, Deserialize, uniffi::Object)]
pub struct NoirProver {
    proof_scheme: NoirProofScheme,
    program: ProgramArtifact,
}

impl NoirProver {
    /// Generate the proof scheme of the given Noir circuit.
    /// * `circuit_json_str` - The compiled Noir circuit JSON as a string.
    pub fn from_circuit(circuit_json_str: &String) -> Result<Self, NoirProverError> {
        let program: ProgramArtifact = {
            sonic_rs::from_str(&circuit_json_str.to_string())
                .map_err(|e| NoirProverError::CreationError(e.to_string()))?
        };

        let proof_scheme = NoirProofScheme::from_program(program.clone())
            .map_err(|e| NoirProverError::CreationError(e.to_string()))?;
        Ok(Self {
            proof_scheme,
            program,
        })
    }

    /// Generates a proof of the loaded Noir circuit, for the given inputs, with detailed metrics.
    /// * `input_json_str` - The circuit inputs in a JSON format as a string.
    fn prove(&self, input_json_str: &str) -> Result<NoirProofResult, NoirProverError> {
        let overall_start = std::time::Instant::now();

        // Witness generation
        let witness_start = std::time::Instant::now();
        let (input_map, _expected_return_value) = self.generate_witness_map(input_json_str)?;

        let initial_witness = self
            .program
            .abi
            .encode(&input_map, None)
            .map_err(|e| NoirProverError::CreationError(e.to_string()))?;
        let mut foreign_call_executor = DefaultForeignCallBuilder::default()
            .with_mocks(false)
            .build::<FieldElement>();
        let blackbox_solver = Bn254BlackBoxSolver(false);
        let mut witness_stack = execute_program(
            &self.program.bytecode,
            initial_witness,
            &blackbox_solver,
            &mut foreign_call_executor,
        )
        .map_err(|e| NoirProverError::ProofGenerationError(e.to_string()))?;
        let witness_map = witness_stack.pop().unwrap().witness;
        let (input_map, return_input_value) = self.program.abi.decode(&witness_map).unwrap();
        let witness_generation_duration = witness_start.elapsed();

        // Proof generation
        let proof_start = std::time::Instant::now();
        let proof = self
            .proof_scheme
            .prove(&input_map)
            .map_err(|e| NoirProverError::ProofGenerationError(e.to_string()))?;
        let proof_generation_duration = proof_start.elapsed();

        let overall_duration = overall_start.elapsed();

        // Return value
        // TODO: Investigate how to get the actual return value with ProveKit.
        let return_value = serialize_return_value(return_input_value)
            .map_err(|e| NoirProverError::ReturnValueError(e.to_string()))?;

        // Calculate metrics
        let overall_duration_secs = overall_duration.as_secs_f64();
        let witness_generation_duration_secs = witness_generation_duration.as_secs_f64();
        let proof_generation_duration_secs = proof_generation_duration.as_secs_f64();

        // Use the number of constraints as our "step count" equivalent
        let constraint_count = witness_map.into_iter().count() as u32;
        let constraint_count_f64 = constraint_count as f64;

        let overall_frequency = constraint_count_f64 / overall_duration_secs;
        let witness_generation_frequency = constraint_count_f64 / witness_generation_duration_secs;
        let proof_generation_frequency = constraint_count_f64 / proof_generation_duration_secs;

        let proof_data = sonic_rs::to_string(&proof)
            .map_err(|e| NoirProverError::VerificationError(e.to_string()))?;
        let proof_size = proof_data.len() as u32;

        Ok(NoirProofResult {
            return_value,
            overall_duration: overall_duration_secs,
            witness_generation_duration: witness_generation_duration_secs,
            proof_generation_duration: proof_generation_duration_secs,
            overall_frequency,
            witness_generation_frequency,
            proof_generation_frequency,
            proof_size,
            constraint_count,
            proof: proof_data,
        })
    }

    /// Generate the ACIR witness map expected by the `ProveKit::prove` function from the input JSON
    /// string.
    /// * `input_json_str` - The circuit inputs in a JSON format as a string.
    fn generate_witness_map(
        &self,
        input_json_str: &str,
    ) -> Result<(InputMap, Option<InputValue>), NoirProverError> {
        let has_params = !self.program.abi.parameters.is_empty();
        let has_input = !input_json_str.is_empty();

        // If no parameters expected and no input provided, return empty map
        if !has_params && !has_input {
            return Ok((BTreeMap::new(), None));
        }

        // If parameters expected but no input provided, error
        if has_params && !has_input {
            return Err(NoirProverError::CreationError(String::from(
                "The ABI expects parameters but no input were provided.",
            )));
        }

        // Parse the input (handles both cases: params expected or not)
        let mut inputs = Format::Json
            .parse(input_json_str, &self.program.abi)
            .map_err(|e| NoirProverError::CreationError(e.to_string()))?;
        let return_value = inputs.remove(MAIN_RETURN_NAME);

        Ok((inputs, return_value))
    }

    /// Verify a given Noir proof for the current circuit proof scheme with timing metrics.
    /// * `proof` - The ProveKit's Spartan WHIR Noir proof to be verified.
    pub fn verify(&self, proof: String) -> Result<NoirVerifyResult, NoirProverError> {
        let verification_start = std::time::Instant::now();

        let proof = sonic_rs::from_str(&proof)
            .map_err(|e| NoirProverError::VerificationError(e.to_string()))?;
        self.proof_scheme
            .verify(&proof)
            .map_err(|e| NoirProverError::VerificationError(e.to_string()))?;

        let verification_duration = verification_start.elapsed();

        Ok(NoirVerifyResult {
            verification_duration: verification_duration.as_secs_f64(),
        })
    }
}

fn serialize_return_value(return_value: Option<InputValue>) -> Result<String, NoirProverError> {
    return_value.map_or_else(|| Ok(String::new()), serialize_return_value_inner)
}

fn serialize_return_value_inner(return_value: InputValue) -> Result<String, NoirProverError> {
    match return_value {
        InputValue::Field(field) => Ok(field.to_string()),
        InputValue::String(string) => Ok(string),
        InputValue::Vec(vec) => {
            let vec_str = vec
                .iter()
                .map(|item| serialize_return_value_inner(item.clone()).unwrap())
                .collect::<Vec<String>>()
                .join(",");
            Ok(vec_str)
        }
        InputValue::Struct(map) => {
            let map_str = map
                .iter()
                .map(|(key, value)| {
                    format!(
                        "{}: {}",
                        key,
                        serialize_return_value_inner(value.clone()).unwrap()
                    )
                })
                .collect::<Vec<String>>()
                .join(",");
            Ok(map_str)
        }
    }
}

/// Generate a Noir proof of the given Noir circuit with the provided inputs, returning detailed
/// metrics.
/// * `circuit_json_str` - The compiled Noir circuit JSON as a string.
/// * `input_json_str` - The circuit inputs in a JSON format as a string.
#[uniffi::export]
pub fn generate_proof(
    circuit_json_str: &String,
    /* trunk-ignore(clippy/ptr_arg) */
    input_json_str: &String,
) -> Result<NoirProofResult, NoirProverError> {
    let prover = NoirProver::from_circuit(circuit_json_str)?;
    prover.prove(input_json_str)
}

/// Verify a Noir proof, given the circuit to verify against, returning detailed metrics.
/// * `circuit_json_str` - The compiled Noir circuit JSON as a string.
/// * `proof` - The ProveKit's Spartan WHIR Noir proof to be verified.
#[uniffi::export]
pub fn verify_proof(
    circuit_json_str: &String,
    proof: String,
) -> Result<NoirVerifyResult, NoirProverError> {
    let prover = NoirProver::from_circuit(circuit_json_str)?;
    prover.verify(proof)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{fs::File, path::Path};

    #[test]
    fn test_generate_proof() {
        let circuit_path = String::from("test_data/noir_fib/target/noir_fib.json");
        let file = File::open(Path::new(&circuit_path)).expect("Failed opening circuit.json");
        let program_artifact: ProgramArtifact =
            sonic_rs::from_reader(file).expect("Failed reading JSON circuit");
        let circuit_json_str =
            sonic_rs::to_string(&program_artifact).expect("Failed to stringify ProgramArtifact");

        let input_json_str = String::from(r#"{"return": "0x0"}"#);

        let proof_result = generate_proof(&circuit_json_str, &input_json_str).unwrap();
        verify_proof(&circuit_json_str, proof_result.proof).unwrap();
    }

    #[test]
    fn test_proof_workflow() {
        let circuit_path = String::from("test_data/noir_fib/target/noir_fib.json");
        let file = File::open(Path::new(&circuit_path)).expect("Failed opening circuit.json");
        let program_artifact: ProgramArtifact =
            sonic_rs::from_reader(file).expect("Failed reading JSON circuit");
        let circuit_json_str =
            sonic_rs::to_string(&program_artifact).expect("Failed to stringify ProgramArtifact");

        let input_json_str = String::from(r#"{"return": "0x0"}"#);

        let prover = NoirProver::from_circuit(&circuit_json_str).expect("Failed to create prover");
        let proof_result = prover
            .prove(&input_json_str)
            .expect("Failed to generate proof");
        prover
            .verify(proof_result.proof)
            .expect("Failed to verify proof");
    }
}
