# name: tests
# description: Тесты для audiopie (Vite + React/TS + Electron)
---
- Анализирует package.json → использует vitest/playwright/supertest
- Запускает `npm run test`  для unit tests, `npm run test:e2e` для e2e tests, `npm run lint` для проверки стилей
- Фиксит фейлы через edit tool
