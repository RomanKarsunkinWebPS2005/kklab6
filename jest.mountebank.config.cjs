/** @type {import('jest').Config} */
const base = require('./jest.config.cjs');

module.exports = {
  ...base,
  testMatch: ['<rootDir>/src/**/*.mountebank.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverage: false,
  collectCoverageFrom: [],
  coverageThreshold: undefined,
  testTimeout: 15_000,
};
