// Proof sharing constants
export const PROOF_SHARING = {
  VERSION: "1.0.0",
  FILE_EXTENSION: ".cairoproof.json",
  TEMP_FILE_PREFIX: "temp_proof_",
  SHARE_FILE_PREFIX: "cairo_proof_",
  MIME_TYPE: "application/json",
  UTI: "public.json",
} as const;

// UI messages
export const MESSAGES = {
  SHARE_DIALOG_TITLE: "Share Cairo Proof",
  INVALID_PROOF_FORMAT: "Invalid proof data format in selected file.",
  IMPORT_ERROR:
    "Failed to import proof from file. Please check the file format.",
  SHARE_ERROR: "Failed to share proof. Please try again.",
  FILE_ACCESS_ERROR:
    "Cannot access the selected file. Please try selecting the file again or save it to your device storage first.",
  UNSUPPORTED_FILE:
    "Only local files can be imported. Please select a file from your device storage.",
  INVALID_FILE_FORMAT: "The file does not contain valid proof data.",
  PROOF_LOADED: "Proof Loaded!",
  ERROR_LOADING_FILE: "Error Loading File",
  PROCESSING_FILE_ERROR:
    "An error occurred while processing the file. Please try again.",
} as const;
