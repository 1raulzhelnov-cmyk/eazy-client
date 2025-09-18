# Инструкции по сборке iOS для EAZY FOOD

## ✅ Выполненные изменения

- Обновлен `capacitor.config.ts` с правильными параметрами:
  - `appId: "com.eazy.food"`
  - `appName: "EAZY FOOD"`
- Обновлен `ios/App/App/Info.plist` с правильным Bundle ID

## 📱 Шаги для сборки iOS

### 1. Подготовка проекта
```bash
# Установка зависимостей
npm install

# Сборка веб-версии
npm run build

# Добавление iOS платформы (если еще не добавлена)
npx cap add ios

# Синхронизация с iOS проектом
npx cap sync ios
```

### 2. Открытие в Xcode
```bash
# Открыть проект в Xcode
npx cap open ios
```

### 3. Настройка в Xcode

#### Signing & Capabilities
- Откройте `ios/App/App.xcworkspace`
- Выберите таргет `App`
- Перейдите в `Signing & Capabilities`
- Установите:
  - **Team**: выберите учетную запись Raul Zhelnov
  - **Build Identifier**: `com.eazy.food` (уже настроено)
  - **Deployment Target**: iOS 15.0 или выше

#### Версионирование
- В разделе `General`:
  - **Version**: 1.0.0
  - **Build**: 1

### 4. Сборка для TestFlight

#### Подготовка к архивированию
1. Выберите устройство: **Any iOS Device (arm64)**
2. Убедитесь, что схема настроена на **Release**

#### Создание архива
1. **Product** → **Archive**
2. После успешной сборки откроется **Organizer**
3. Выберите архив и нажмите **Distribute App**
4. Выберите **App Store Connect**
5. Выберите **Upload**
6. Следуйте инструкциям мастера

### 5. TestFlight настройка

1. Перейдите в [App Store Connect](https://appstoreconnect.apple.com)
2. Выберите приложение **EAZY FOOD**
3. Перейдите во вкладку **TestFlight**
4. Дождитесь статуса **Ready to Test** (обычно 10-30 минут)
5. Включите **Internal Testing**
6. Добавьте тестировщиков

## 🔧 Полезные команды

```bash
# Полная пересборка и синхронизация
npm run build && npx cap sync ios

# Открыть проект в Xcode
npx cap open ios

# Обновить Capacitor плагины
npx cap update ios
```

## 📝 Требования к системе

- **macOS** с установленной **Xcode** (последняя версия)
- **iOS Developer Program** аккаунт
- Сертификаты разработчика настроены в Xcode

## ⚠️ Важные замечания

1. **Bundle ID** уже настроен: `com.eazy.food`
2. **App Name** установлен: `EAZY FOOD`
3. Убедитесь, что в `.env` нет приватных ключей
4. Все публичные API ключи (Supabase) уже правильно настроены в коде

## 🚀 После успешной загрузки

После загрузки в App Store Connect:
1. Сборка появится в TestFlight через 10-30 минут
2. Добавьте внутренних тестировщиков
3. Отправьте ссылку для тестирования
4. При готовности - отправьте на модерацию в App Store

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в Xcode
2. Убедитесь в правильности сертификатов
3. Проверьте статус сборки в App Store Connect