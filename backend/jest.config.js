module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 60000,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/__tests__/**',
    '!src/testutils/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html'],
};