## Требования

- Xcode 15+ (Command Line Tools)
- macOS с установленными CocoaPods (`sudo gem install cocoapods`)
- Node.js 18+, npm 9+
- Ruby 3 (для fastlane, опционально)

## Переменные проекта

- bundleId: `com.eazy.app` (изменить при необходимости в `ios/App/Config/*.xcconfig`)
- appName: `Eazy` (в `capacitor.config.ts` и `Info.plist` отображаемое имя)
- MARKETING_VERSION: берется из `ios/App/Config/*.xcconfig` (по умолчанию `0.0.0`)
- CURRENT_PROJECT_VERSION: билд-номер из `ios/App/Config/*.xcconfig` (по умолчанию `1`)

## Команды локально

```bash
npm ci
npm run build:ios
open ios/App/App.xcworkspace
```

В Xcode: выберите схему `Eazy-Release` → `Any iOS Device` → `Product` → `Archive` → `Distribute` → `App Store Connect` → `Upload`.

## Capacitor и webDir

- `webDir` = `dist`. Скрипт `build:ios` выполняет `npm run build` и затем `npx cap sync ios`.
- Для локальной разработки можно указать dev-сервер через переменную окружения `CAP_SERVER_URL` (см. `capacitor.config.ts`).

## Иконки и сплэш

Сгенерировать ассеты:

```bash
npx @capacitor/assets generate --ios
```

Положить исходники в `resources/`:

- app icon: `resources/icon.png` (1024x1024, без альфа канала)
- splash: `resources/splash.png` (2732x2732, центрированный логотип)

Если финальных ассетов нет — используйте временные плейсхолдеры. После получения финальных файлов, перегенерируйте ассеты командой выше и закоммитьте изменения.

## Firebase (если используется)

- Положить `GoogleService-Info.plist` в `ios/App/App/GoogleService-Info.plist` (НЕ коммитить — добавлено в .gitignore).
- Для Android — `google-services.json` (уже игнорируется глобально).

## ATS и домены API

- `NSAppTransportSecurity` → `NSAllowsArbitraryLoads` = false. При необходимости разрешите конкретные домены через исключения ATS (добавьте в `Info.plist`).

## Версии и номер сборки

- Обновляйте `MARKETING_VERSION` и `CURRENT_PROJECT_VERSION` в `ios/App/Config/Debug.xcconfig` и `ios/App/Config/Release.xcconfig`.
- Номер сборки должен инкрементироваться для каждого аплоада в TestFlight.

## Fastlane (опционально)

В каталоге `ios`:

```bash
bundle exec fastlane init
```

Рекомендуемые лейны:

- `build`: сборка `.ipa` (gym)
- `beta`: загрузка в TestFlight (pilot)

Секреты (App Store Connect API key, teamId) храните вне репозитория. Добавьте пример `.env.fastlane.example`.

## GitHub Actions (опционально)

Создайте `.github/workflows/ios-beta.yml`, который по тэгу `v*`:
- выполняет web build
- `npx cap sync ios`
- запускает `fastlane beta`

Секреты через GitHub Secrets: `APP_STORE_CONNECT_API_KEY`, `APP_STORE_CONNECT_ISSUER_ID`, `APP_STORE_CONNECT_KEY_ID`, `MATCH_PASSWORD` и т.д.

## Примечания по сборке

- Схемы `Eazy-Debug`/`Eazy-Release` можно создать в Xcode (Product → Scheme → Manage Schemes...), включив Shared.
- В Signing & Capabilities оставьте `Automatically manage signing`, укажите вашу команду (Team).
- Для чистой релизной сборки можно очистить DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData/*`.
