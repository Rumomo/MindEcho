import { defineConfig } from 'vitest/config';

// Vitest configuration for backend tests
// Esta configuración está diseñada para ejecutar pruebas en un entorno Node.js,
// asegurando que las pruebas puedan interactuar con las funcionalidades del backend
// sin problemas relacionados con el entorno del navegador.
export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        setupFiles: ['./src/__tests__/setup.ts'],
        include: ['src/__tests__/**/*.test.ts'],
        testTimeout: 60000,
        hookTimeout: 60000,
        coverage: {
            reporter: ['text', 'html'],
        },
    },
});