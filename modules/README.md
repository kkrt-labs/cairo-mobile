# React Native - Native Modules

Native modules, written in Kotlin and Swift, to be used from the React Native
front-end are defined here.

See the [Expo Modules docs](https://docs.expo.dev/modules/overview/) to create
expo modules.

## Modules

### cairo-m-bindings

The first module created was cairo-m, to use the Cairo M project, initially
written in Rust, with Kotlin and Swift bindings generated with UniFFI.

### noir-provekit

The noir-provekit module provides Noir ProveKit functionality for generating and
verifying zero-knowledge proofs using the Noir proving system. It uses the
`noir_provekit` Rust crate with UniFFI-generated bindings for Kotlin and Swift.
