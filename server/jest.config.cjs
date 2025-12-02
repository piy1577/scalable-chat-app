module.exports = {
    collectCoverage: true,
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "<rootDir>/src/model/", // ignore mongoose models
    ],
    setupFilesAfterEnv: ["<rootDir>/test-setup.js"],
};
