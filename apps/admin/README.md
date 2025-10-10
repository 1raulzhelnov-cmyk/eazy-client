# Easy Admin (MVP)

SPA админ-панель: React 18 + TS + Vite, Tailwind + shadcn/ui, React Router v6, TanStack Query, Axios, Zod + RHF, Firebase Auth. 

## Запуск

- pnpm i
- pnpm --filter @easy/admin dev

Либо в папке `apps/admin`:

- pnpm i
- pnpm dev

## Переменные окружения

См. `.env.sample` — создайте `.env.local` рядом.

```
VITE_API_BASE_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

## Навигация

- Dashboard
- Users
- Suppliers (+ detail)
- Orders (+ detail)
- Delivery
- (skeleton) Finance, Content, Disputes, Campaigns, Settings, Reports, Comms, Support

## Backend API

Используются эндпоинты: `/api/analytics/*`, `/api/admin/users`, `/api/users/:uid*`, `/api/admin/suppliers*`, `/api/suppliers/:sid`, `/api/orders*`, `/api/delivery*`.

## Тесты

- Vitest + RTL: базовые smoke-тесты (TODO)

## TODO / ограничения

- Нет полноценного списка водителей (заглушка)
- Нет SSR/SEO — чистый SPA
- Минимальный DataTable без bulk-actions
