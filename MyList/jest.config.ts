import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true
};

export default config;
