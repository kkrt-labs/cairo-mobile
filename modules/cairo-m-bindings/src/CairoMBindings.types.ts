export type RunResult = {
  return_value: number;
  steps_per_second_execution: number;
  steps_per_second_e2e: number;
  execution_duration: number;
  trace_generation_duration: number;
  overall_duration: number;
};
