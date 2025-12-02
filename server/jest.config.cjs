module.exports = {
    collectCoverage: true,
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "<rootDir>/src/model/", // ignore mongoose models
    ],
    setupFilesAfterEnv: ["<rootDir>/test-setup.js"],
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 0,
            lines: 0,
            statements: 0,
        },
        "src/**/*.middleware.js": {
            statements: 90,
        },
        "src/**/*.controller.js": {
            statements: 90,
        },
        "src/**/*.service.js": {
            statements: 90,
        },
    },
};
