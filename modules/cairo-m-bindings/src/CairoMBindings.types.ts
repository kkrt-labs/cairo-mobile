/**
 * The result of a successful program execution.
 *
 * ## Fields
 *
 * * `returnValue` - The return value of the program
 * * `frequency` - The frequency of the trace generation, in Hz
 */
export type RunResult = {
  returnValue: number;
  frequency: number;
};
