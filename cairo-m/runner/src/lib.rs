uniffi::setup_scaffolding!();

use cairo_m_compiler::CompiledProgram;

/// Represents the possible errors that can occur in the mobile VM.
#[derive(Debug, thiserror::Error, uniffi::Error)]
pub enum MobileVmError {
    #[error("VM Error: {message}")]
    Vm { message: String },
    #[error("IO Error: {message}")]
    Io { message: String },
    #[error("JSON parsing error: {message}")]
    Json { message: String },
}

/// The result of a successful program execution.
///
/// # Fields
///
/// * `return_value` - The return value of the program
/// * `frequency` - The frequency of the trace generation, in Hz
#[derive(Debug, uniffi::Record)]
pub struct RunResult {
    pub return_value: u32,
    pub frequency: f64,
}

/// Runs a compiled Cairo program and returns the result and execution metrics.
///
/// This function takes the JSON content of a compiled Cairo program,
/// executes it and measures performance.
/// It writes execution trace files (`trace.bin` and `memory.bin`) to disk.
///
/// ## Parameters
///
/// * `file_content` - JSON string containing the compiled Cairo program
///
/// ## Returns
///
/// Returns `RunResult` containing the program's return value and performance metrics
/// including execution time, trace generation time, and steps per second.
///
/// ## Errors
///
/// Returns a `MobileVmError` if JSON parsing, VM execution, or file I/O fails.
#[uniffi::export]
fn run_program(file_content: String) -> Result<RunResult, MobileVmError> {
    let overall_start = std::time::Instant::now();
    let compiled_program: CompiledProgram =
        sonic_rs::from_str(&file_content).map_err(|e| MobileVmError::Json {
            message: e.to_string(),
        })?;

    let output = cairo_m_runner::run_cairo_program(&compiled_program, "main", Default::default())
        .map_err(|e| MobileVmError::Vm {
        message: e.to_string(),
    })?;

    output
        .vm
        .write_binary_trace("trace.bin")
        .map_err(|e| MobileVmError::Io {
            message: e.to_string(),
        })?;
    output
        .vm
        .write_binary_memory_trace("memory.bin")
        .map_err(|e| MobileVmError::Io {
            message: e.to_string(),
        })?;
    let overall_duration = overall_start.elapsed();

    let num_steps = output.vm.trace.len() as f64;
    let frequency = num_steps / overall_duration.as_secs_f64();

    Ok(RunResult {
        return_value: output.return_value,
        frequency,
    })
}

#[cfg(test)]
mod tests {
    use std::fs;

    use super::*;

    /// A helper struct to clean up generated files at the end of a test.
    struct FileCleanup(&'static [&'static str]);

    impl Drop for FileCleanup {
        fn drop(&mut self) {
            for path in self.0 {
                let _ = std::fs::remove_file(path);
            }
        }
    }

    #[test]
    fn test_fibonacci_program() {
        let _cleanup = FileCleanup(&["memory.bin", "trace.bin"]);
        let file_content = fs::read_to_string("test_data/fibonacci.json").unwrap();
        let result = run_program(file_content).unwrap();
        assert_eq!(result.return_value, 55);
    }
}
