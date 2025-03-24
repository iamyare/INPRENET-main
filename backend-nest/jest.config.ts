export default {
    moduleNameMapper: {
      '^src/(.*)$': '<rootDir>/src/$1',
    },
    moduleDirectories: ['node_modules', 'src'],
    testEnvironment: 'node',
    preset: 'ts-jest',
  };
  