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
        "./src/**/*.middleware.js": {
            lines: 90,
            statements: 90
        },
        "./src/**/*.controller.js": {
            lines: 90,
            statements: 90
        },
        "./src/**/*.service.js": {
            lines: 90,
            statements: 90
        },
    }
};
