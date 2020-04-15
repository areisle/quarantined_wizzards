// main jest configuration file
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');

module.exports = {
    rootDir: BASE_DIR,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'server/**ts'
    ],
    coverageReporters: [
        'clover',
        'text',
        'json',
        'json-summary',
        'lcov',
    ],
    globals: {
        "ts-jest": {
          "tsConfig": "tsconfig.server.json"
        }
    },
    testRunner: 'jest-circus/runner',
    testRegex: '.*\\.test\\.ts',
    testEnvironment: 'node',
    testPathIgnorePatterns: [
        '/node_modules/',
    ],
    moduleFileExtensions: [
        'js',
        'json',
        'ts',
    ],
    preset: 'ts-jest'
};
