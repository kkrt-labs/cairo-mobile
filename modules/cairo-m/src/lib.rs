uniffi::setup_scaffolding!();
use cairo_m_runner::vm::VmError;
use cairo_m_runner::memory::MemoryError;
use cairo_m_runner;
use cairo_m_compiler::CompiledProgram;
use sonic_rs;
use std::fs;


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

impl From<VmError> for MobileVmError {
    fn from(err: VmError) -> Self {
        Self::Vm {
            message: err.to_string(),
        }
    }
}

impl From<MemoryError> for MobileVmError {
    fn from(err: MemoryError) -> Self {
        Self::Vm {
            message: err.to_string(),
        }
    }
}

impl From<std::io::Error> for MobileVmError {
    fn from(err: std::io::Error) -> Self {
        Self::Io {
            message: err.to_string(),
        }
    }
}

impl From<sonic_rs::Error> for MobileVmError {
    fn from(err: sonic_rs::Error) -> Self {
        Self::Json {
            message: err.to_string(),
        }
    }
}

impl From<cairo_m_runner::RunnerError> for MobileVmError {
    fn from(err: cairo_m_runner::RunnerError) -> Self {
        Self::Vm {
            message: err.to_string(),
        }
    }
}

/// The result of a successful program execution.
#[derive(Debug, uniffi::Record)]
pub struct RunResult {
    pub return_value: u32,
    pub steps_per_second_execution: f64,
    pub steps_per_second_e2e: f64,
}

/// Runs the pre-compiled Fibonacci program and returns its result.
///
/// This function reads a compiled Cairo program from `src/fibonacci.json`,
/// executes it, and measures performance. It also writes execution trace
/// files (`trace.bin` and `memory.bin`).
///
/// ## Errors
///
/// Returns a `MobileVmError` if file I/O, JSON parsing, or VM execution fails.
#[uniffi::export]
fn run_program() -> Result<RunResult, MobileVmError> {
    let overall_start = std::time::Instant::now();
    let file_content = fs::read_to_string("src/fibonacci.json")?;
    let compiled_program: CompiledProgram = sonic_rs::from_str(&file_content)?;

    let start = std::time::Instant::now();
    let output = cairo_m_runner::run_cairo_program(&compiled_program, &"main", Default::default())?;
    let run_duration = start.elapsed();

    output.vm.write_binary_trace("trace.bin")?;
    output.vm.write_binary_memory_trace("memory.bin")?;
    let overall_duration = overall_start.elapsed();

    let num_steps = output.vm.trace.len();
    let steps_per_second_execution = num_steps as f64 / run_duration.as_secs_f64();
    let steps_per_second_e2e = num_steps as f64 / overall_duration.as_secs_f64();


    Ok(RunResult {
        return_value: output.return_value,
        steps_per_second_execution,
        steps_per_second_e2e,
    })
}

#[cfg(test)]
mod tests {
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
        let result = run_program().unwrap();
        println!("result: {:?}", result);
        assert_eq!(result.return_value, 55);
    }
}
