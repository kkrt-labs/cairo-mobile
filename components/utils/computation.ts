// Format frequency with appropriate unit (Hz, kHz, MHz, GHz)
export const formatFrequency = (frequencyInHz: number): string => {
  if (frequencyInHz >= 1000000000) {
    // GHz range
    const ghz = frequencyInHz / 1000000000;
    return `${ghz.toFixed(ghz >= 10 ? 1 : 2)} GHz`;
  } else if (frequencyInHz >= 1000000) {
    // MHz range
    const mhz = frequencyInHz / 1000000;
    return `${mhz.toFixed(mhz >= 10 ? 1 : 2)} MHz`;
  } else if (frequencyInHz >= 1000) {
    // kHz range
    const khz = frequencyInHz / 1000;
    return `${khz.toFixed(khz >= 10 ? 1 : 2)} kHz`;
  } else {
    // Hz range
    return `${frequencyInHz.toFixed(frequencyInHz >= 10 ? 1 : 2)} Hz`;
  }
};

// Format time with appropriate unit (hr, min, s, ms, μs, ns)
export const formatTime = (timeInSeconds: number): string => {
  if (timeInSeconds >= 3600) {
    // Hours range
    const hours = timeInSeconds / 3600;
    return `${hours.toFixed(hours >= 10 ? 1 : 2)} hr`;
  } else if (timeInSeconds >= 60) {
    // Minutes range
    const minutes = timeInSeconds / 60;
    return `${minutes.toFixed(minutes >= 10 ? 1 : 2)} min`;
  } else if (timeInSeconds >= 1) {
    // Seconds range
    return `${timeInSeconds.toFixed(timeInSeconds >= 10 ? 1 : 2)} s`;
  } else if (timeInSeconds >= 0.001) {
    // Milliseconds range
    const ms = timeInSeconds * 1000;
    return `${ms.toFixed(ms >= 10 ? 1 : 2)} ms`;
  } else if (timeInSeconds >= 0.000001) {
    // Microseconds range
    const μs = timeInSeconds * 1000000;
    return `${μs.toFixed(μs >= 10 ? 1 : 2)} μs`;
  } else {
    // Nanoseconds range
    const ns = timeInSeconds * 1000000000;
    return `${ns.toFixed(ns >= 10 ? 1 : 2)} ns`;
  }
};
