# Eazy Client — Capacitor (React + iOS/Android)

UI не менялся. Обновлены конфиги, пайплайн сборки и стабильность iOS.

## Быстрый старт (iOS)

1. Установите зависимости:
```bash
npm ci || npm install
```
2. Сборка и синхронизация iOS:
```bash
npm run build:ios
```
3. Откройте проект в Xcode:
```bash
open ios/App/App.xcworkspace
```
4. В Xcode:
 - Product → Clean Build Folder (⇧⌘K)
 - Product → Build (⌘B)
 - Product → Run (⌘R) на устройстве
 - Для архива: выберите Any iOS Device → Product → Archive → Upload to App Store Connect

## Настройки
- Vite: `vite.config.ts` с `base: './'`, `assetsInlineLimit: 0`
- Capacitor: `capacitor.config.ts` c `webDir: 'dist'`, без `server.url` для прод
- iOS UIScene: `SceneDelegate.swift`, `AppDelegate.application(_:configurationForConnecting:...)`, манифест сцен в `Info.plist`
- Bundle ID: `eazy.app`

## NPM-скрипты
- `dev` — vite dev server
- `build` — прод сборка веба
- `build:ios` — веб-сборка + `cap copy ios` + `cap sync ios`
- `postmerge` — автоматическая сборка после merge
- `lint` / `lint:fix` — ESLint проверки
- `clean:derived` — очистка Xcode DerivedData

## Чек-лист устройства
- Старт без белого экрана, нет `DownloadFailed`
- Нет предупреждения `UIScene lifecycle will soon be required`
- Контент грузится из `capacitor://localhost` (без dev-url)
- Архивация в Xcode проходит
- В релизе нет лишних логов/alert

## Примечания
- Для Mapbox/Google Places нужны ключи (см. `Map.tsx`, `AddressAutocomplete.tsx`)
- Для системных push — APNs/FCM и Capacitor Push Notifications
