export default {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "jest-environment-jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "mjs"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  reporters: [
    "default",
    ["jest-html-reporter", {
      pageTitle: "Test Suite Report",
      outputPath: "./reports/test-report.html",
      includeFailureMsg: true,
      includeConsoleLog: true,
    }]
  ],
  testMatch: ["**/?(*.)+(spec|test).{ts,tsx}"],
  collectCoverage: false,
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
  },
};
