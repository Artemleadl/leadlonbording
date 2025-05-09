# Leadl Демонстрация

Это демонстрационное приложение для поиска и отображения сообщений из базы данных JSON.

## Описание

Leadl — платформа для поиска и фильтрации пользовательских запросов (лидов) с возможностью оценки релевантности. Интерфейс максимально простой: строка поиска, таблица с сообщениями и рейтингом, карточки тарифов.

## Структура проекта

- `index.html` — основной HTML-файл приложения
- `style.css` — стили для интерфейса
- `script.js` — основной JavaScript-код (логика поиска, фильтрации, отображения)
- `data/messages.json` — база сообщений (JSON)
- `test.js` — unit-тесты для ключевых функций
- `server/server.py` — простой Python-сервер для локальной разработки
- `memory-bank/` — документация и контекст проекта

## Как обновить базу сообщений

1. Поместите новый файл базы (например, выгрузку из Excel) в корень или папку `data/`.
2. Переименуйте или скопируйте его как `data/messages.json` (или используйте скрипт-конвертер, если нужно).
3. Закоммитьте и отправьте изменения в репозиторий — база автоматически обновится на GitHub Pages.

## Как запустить приложение

### 1. В облаке (GitHub Pages)
- Просто откройте: https://artemleadl.github.io/leadlonbording/
- Все изменения после push появляются через 2–5 минут.

### 2. Локально через Python-сервер
1. Убедитесь, что установлен Python 3.x
2. В терминале выполните:
   ```bash
   python server/server.py
   ```
3. Откройте в браузере: http://localhost:8000

## Как использовать приложение
1. Введите запрос в поле поиска (минимум 3 символа)
2. Нажмите "Найти" или Enter
3. В таблице отобразятся только первые 10 релевантных сообщений
4. Если ничего не найдено — появится сообщение "Ничего не найдено"

## Как запустить unit-тесты
1. Откройте сайт в браузере
2. Откройте консоль разработчика (F12)
3. Выполните команду:
   ```js
   runAllTests()
   ```
4. Если все тесты пройдены — увидите зелёное сообщение. Ошибки будут в консоли.

## Как деплоить и поддерживать
- Все изменения после `git push` автоматически попадают на GitHub Pages.
- Для обновления базы — просто замените файл `data/messages.json` и отправьте изменения.
- Для добавления новых функций — обновите `script.js` и протестируйте через `test.js`.

## Контакты и поддержка
- Вопросы по коду, баги, предложения: через Issues на GitHub или напрямую разработчику.
- Для расширения функционала — пишите в Issues или создайте Pull Request.

## Важно
- Вся логика и база данных работают на клиенте (GitHub Pages). Для приватных функций, аналитики и защиты данных потребуется серверная доработка.
- В проекте реализована базовая валидация и защита от XSS, но для production-версии рекомендуется серверная фильтрация и авторизация.

---

**Документация актуальна на момент последнего коммита.** 