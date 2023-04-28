module.exports = {
  roots: [
    "<rootDir>/src",
  ],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  preset: "ts-jest",
};
