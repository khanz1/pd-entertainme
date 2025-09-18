const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },

  moduleNameMapper: {
    "^@models$": "<rootDir>/src/models",
    "^@middleware/(.*)$": "<rootDir>/src/middleware/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
  },
  verbose: true,
  testTimeout: 30000,
  detectOpenHandles: true,
  silent: true,
  forceExit: true,
};
