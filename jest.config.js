module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    Logger: {},
    DocumentApp: {}
  },
  moduleNameMapper: {
    '^@/(.+)': '<rootDir>/src/$1'
  }
}
