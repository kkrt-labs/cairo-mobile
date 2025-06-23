/**
 * The result of a successful program execution.
 *
 * ## Fields
 *
 * * `return_value` - The return value of the program
 * * `frequency` - The frequency of the trace generation, in Hz
 */
export type RunResult = {
  return_value: number;
  frequency: number;
};
