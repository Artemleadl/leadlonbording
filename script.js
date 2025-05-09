console.log('Скрипт загружен!');

// Полностью восстановленный скрипт с интеграцией базы данных

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен!');
    
    // Форма поиска
    const searchInput = document.querySelector('.search_bar');
    const searchButton = document.querySelector('.outer-cont');
    
    const errorMessageElement = document.querySelector('.tooltip');
    const tableBody = document.querySelector('.invoice-table tbody');
    const tableContainer = document.querySelector('.table-container');
    const priceCards = document.querySelector('.cards-container');
    const loadingContainer = document.querySelector('.loading-container');

    // ПРИНУДИТЕЛЬНО ОТОБРАЖАЕМ КАРТОЧКИ С ЦЕНАМИ
    setTimeout(() => {
        if (priceCards) {
            console.log('Принудительное отображение карточек с ценами');
            priceCards.style.display = 'flex';
            priceCards.style.visibility = 'visible';
            priceCards.style.opacity = '1';
        } else {
            console.error('КАРТОЧКИ НЕ НАЙДЕНЫ В DOM!');
        }
    }, 500);

    // Удаляем фразу "в месяц" после евро в тесте гипотезы
    setTimeout(() => {
        const priceElements = document.querySelectorAll('.price');
        priceElements.forEach(el => {
            if (el.textContent.includes('€ / месяц')) {
                el.textContent = el.textContent.replace(' / месяц', '');
                console.log('Удалена фраза "/ месяц" из элемента:', el.textContent);
            }
        });
    }, 600);

    // Дополнительная информация о карточках для отладки
    if (priceCards) {
        console.log('Карточки найдены:');
        console.log('- Display style:', window.getComputedStyle(priceCards).display);
        console.log('- Visibility:', window.getComputedStyle(priceCards).visibility);
        console.log('- Height:', window.getComputedStyle(priceCards).height);
        console.log('- Children count:', priceCards.children.length);
    } else {
        console.error('КАРТОЧКИ НЕ НАЙДЕНЫ!');
    }

    console.log('Элементы найдены:', {
        searchInput: !!searchInput,
        searchButton: !!searchButton,
        errorMessageElement: !!errorMessageElement,
        tableBody: !!tableBody,
        tableContainer: !!tableContainer,
        priceCards: !!priceCards
    });

    // Проверка всех необходимых элементов
    if (!tableBody || !tableContainer || !errorMessageElement) {
        console.error('ОШИБКА: Не удалось найти один или несколько ключевых элементов!');
        if (errorMessageElement) {
            errorMessageElement.textContent = 'Ошибка инициализации страницы.';
            errorMessageElement.classList.add('visible');
        }
        return;
    }

    // Проверка наличия формы поиска
    if (!searchInput || !searchButton) {
        console.error('ОШИБКА: Не найдена форма поиска!');
        if (errorMessageElement) {
            errorMessageElement.textContent = 'Ошибка инициализации страницы - форма поиска не найдена.';
            errorMessageElement.classList.add('visible');
        }
        return;
    }

    // ПРИНУДИТЕЛЬНО ПОКАЗЫВАЕМ ТАБЛИЦУ
    console.log('Принудительное отображение таблицы');
    tableContainer.style.display = 'block';
    tableContainer.style.visibility = 'visible';
    tableContainer.style.opacity = '1';
    
    // Карточки с ценами всегда показываем
    if (priceCards) {
        priceCards.style.display = 'block';
    }

    // Загрузка данных из JSON файла
    let allMessagesFromJSON = [];
    let jsonLoadAttempts = 0;
    let jsonDataLoaded = false; // Флаг загрузки данных
    
    // ДОБАВЛЕНО: Вызываем функцию загрузки данных
    loadMessagesFromJSON();
    
    // Функция для валидации структуры сообщения
    function validateMessageStructure(message) {
        // Проверяем наличие обязательных полей
        if (!message || typeof message !== 'object') {
            console.error('Некорректная структура сообщения:', message);
            return false;
        }

        // Проверяем обязательные поля
        if (!message.text || typeof message.text !== 'string') {
            console.error('Отсутствует или некорректное поле text:', message);
            return false;
        }

        if (!message.category || typeof message.category !== 'string') {
            console.error('Отсутствует или некорректное поле category:', message);
            return false;
        }

        if (typeof message.rating !== 'number' || message.rating < 1 || message.rating > 5) {
            console.error('Некорректный рейтинг:', message.rating);
            return false;
        }

        // Проверяем длину текста
        if (message.text.length > 1000) {
            console.warn('Текст сообщения превышает максимальную длину:', message.text.length);
            message.text = message.text.substring(0, 1000);
        }

        // Проверяем категорию на соответствие допустимым значениям
        const validCategories = ['psychology', 'develop', 'marketing', 'design'];
        if (!validCategories.includes(message.category)) {
            console.warn('Недопустимая категория:', message.category);
            message.category = 'develop'; // Устанавливаем значение по умолчанию
        }

        return true;
    }

    // Функция для сохранения данных в localStorage
    function cacheMessages(messages) {
        try {
            const cacheData = {
                timestamp: Date.now(),
                messages: messages
            };
            localStorage.setItem('messagesCache', JSON.stringify(cacheData));
            console.log('Данные успешно закэшированы');
        } catch (error) {
            console.error('Ошибка при кэшировании данных:', error);
        }
    }

    // Функция для загрузки данных из кэша
    function loadFromCache() {
        try {
            const cached = localStorage.getItem('messagesCache');
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            const cacheAge = Date.now() - cacheData.timestamp;
            
            // Проверяем актуальность кэша (24 часа)
            if (cacheAge > 24 * 60 * 60 * 1000) {
                console.log('Кэш устарел');
                return null;
            }

            console.log('Загружены данные из кэша');
            return cacheData.messages;
        } catch (error) {
            console.error('Ошибка при загрузке из кэша:', error);
            return null;
        }
    }

    // Модифицируем функцию загрузки данных
    function loadMessagesFromJSON() {
        console.log('Загрузка данных из JSON файла... Попытка #' + (++jsonLoadAttempts));
        
        // Пробуем загрузить из кэша
        const cachedMessages = loadFromCache();
        if (cachedMessages) {
            allMessagesFromJSON = cachedMessages;
            jsonDataLoaded = true;
            console.log('Используем кэшированные данные');
            return;
        }
        
        try {
            if (window.fetch) {
                console.log('Используем fetch API для загрузки JSON');
                const jsonPath = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                    ? 'data/messages.json' 
                    : '/leadlonbording/data/messages.json';
                
                console.log('Путь к JSON файлу:', jsonPath);
                
                fetch(jsonPath)
                    .then(response => {
                        console.log('Fetch response status:', response.status);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        const validMessages = data.filter(message => validateMessageStructure(message));
                        console.log(`Загружено ${data.length} сообщений, валидных: ${validMessages.length}`);
                        
                        if (validMessages.length === 0) {
                            throw new Error('Нет валидных сообщений в данных');
                        }
                        
                        allMessagesFromJSON = validMessages;
                        jsonDataLoaded = true;
                        
                        // Кэшируем валидные данные
                        cacheMessages(validMessages);
                        
                        // Выводим первые 3 сообщения для проверки
                        console.log('Примеры загруженных сообщений (fetch):');
                        validMessages.slice(0, 3).forEach((msg, i) => {
                            console.log(`${i + 1}. ${msg.text.substring(0, 100)}...`);
                        });
                    })
                    .catch(error => {
                        console.error('Ошибка при загрузке через fetch:', error);
                        loadWithXHR();
                    });
            } else {
                console.log('Fetch API недоступен, используем XMLHttpRequest');
                loadWithXHR();
            }
        } catch (error) {
            console.error('Критическая ошибка при загрузке данных:', error);
            // Пробуем загрузить из кэша при ошибке
            const cachedMessages = loadFromCache();
            if (cachedMessages) {
                allMessagesFromJSON = cachedMessages;
                jsonDataLoaded = true;
                console.log('Используем кэшированные данные после ошибки');
            } else {
                console.log('Не удалось загрузить данные из JSON и кэша');
            }
        }
    }
    
    // Загрузка с использованием XMLHttpRequest
    function loadWithXHR() {
        console.log('Загрузка с использованием XMLHttpRequest');
        const xhr = new XMLHttpRequest();
        
        // Модифицируем путь для работы на GitHub Pages
        const jsonPath = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'data/messages.json' 
            : '/leadlonbording/data/messages.json';
        
        console.log('Путь к JSON файлу (XHR):', jsonPath);
        
        xhr.open('GET', jsonPath, true);
        
        xhr.onload = function() {
            console.log('XHR onload status:', xhr.status);
            if (xhr.status === 200) {
                try {
                    // Выводим первые 200 символов ответа для проверки
                    console.log('Ответ получен. Первые 200 символов:', xhr.responseText.substring(0, 200));
                    
                    allMessagesFromJSON = JSON.parse(xhr.responseText);
                    jsonDataLoaded = true;
                    console.log(`Успешно загружено ${allMessagesFromJSON.length} сообщений из JSON`);
                    
                    // Выводим первые 3 сообщения для проверки
                    console.log('Примеры загруженных сообщений (XHR):');
                    allMessagesFromJSON.slice(0, 3).forEach((msg, i) => {
                        console.log(`${i + 1}. ${msg.text.substring(0, 100)}...`);
                    });
                } catch (e) {
                    console.error('Ошибка при разборе JSON:', e);
                    console.error('Не удалось загрузить данные из JSON');
                }
            } else {
                console.error('Ошибка при загрузке JSON. Статус:', xhr.status);
                console.error('Путь запроса:', jsonPath);
                // Пробуем загрузить из альтернативного пути
                tryAlternativePath();
            }
        };
        
        xhr.onerror = function(e) {
            console.error('Ошибка сети при загрузке JSON:', e);
            console.error('Путь запроса:', jsonPath);
            // Пробуем загрузить из альтернативного пути
            tryAlternativePath();
        };
        
        xhr.send();
    }
    
    // Пробуем альтернативные пути к JSON файлу
    function tryAlternativePath() {
        console.log('Пробуем загрузить JSON из альтернативного пути');
        
        // Попытка 1: относительный путь от корня
        const alternativePaths = [
            '/data/messages.json',
            './data/messages.json',
            '../data/messages.json',
            'messages.json',
            '/leadlonbording/data/messages.json'
        ];
        
        const path = alternativePaths[jsonLoadAttempts % alternativePaths.length];
        console.log('Пробуем путь:', path);
        
        const xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    allMessagesFromJSON = JSON.parse(xhr.responseText);
                    jsonDataLoaded = true;
                    console.log(`Успешно загружено ${allMessagesFromJSON.length} сообщений из альтернативного пути`);
                } catch (e) {
                    console.error('Ошибка при разборе JSON из альтернативного пути:', e);
                    console.error('Не удалось загрузить данные из JSON через альтернативный путь');
                }
            } else {
                console.error('Ошибка при загрузке из альтернативного пути. Статус:', xhr.status);
                // Если перепробовали все пути и не смогли загрузить данные
                console.error('Не удалось загрузить данные из JSON файла после нескольких попыток');
            }
        };
        
        xhr.onerror = function() {
            console.error('Ошибка сети при загрузке из альтернативного пути');
            console.error('Не удалось загрузить данные из JSON через альтернативный путь из-за ошибки сети');
        };
        
        xhr.send();
    }
    
    // Загружаем данные при инициализации
    loadMessagesFromJSON();

    // Запускаем проверку загрузки данных через 3 секунды
    setTimeout(() => {
        console.log('Проверка загрузки данных...');
        console.log('Флаг загрузки данных:', jsonDataLoaded);
        console.log('Количество сообщений в базе:', allMessagesFromJSON.length);

        if (!jsonDataLoaded || allMessagesFromJSON.length === 0) {
            console.error('❌ Данные из JSON не были загружены. Поиск будет недоступен.');
            errorMessageElement.textContent = 'Ошибка загрузки данных. Пожалуйста, обновите страницу.';
            errorMessageElement.classList.add('visible');
        } else {
            console.log('✅ Данные успешно загружены. Общее количество сообщений:', allMessagesFromJSON.length);
        }
    }, 3000);

    // Функция для проверки на наличие нецензурных слов
    function containsProfanity(text) {
        const profanityList = ['хуй', 'пизда', 'блять', 'ебать', 'сука', 'хуесос', 'пидор', 'пидорас'];
        const textLower = text.toLowerCase();
        return profanityList.some(word => textLower.includes(word));
    }

    // Новая функция для рейтинга-эмодзи
    function createRatingComponent(messageId) {
        const ratingContainer = document.createElement('div');
        ratingContainer.className = 'rating-container';

        const ratingForm = document.createElement('form');
        ratingForm.className = 'rating-form rating-form-2';
        ratingForm.id = `rating-form-${messageId}`;

        const radios = document.createElement('div');
        radios.id = 'radios';

        // Три варианта рейтинга: супер-счастлив, нейтрально, супер-грустно
        const ratings = [
            {
                class: 'super-happy',
                value: 'super-happy',
                svg: `<svg class="svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14c1.333 1 2.667 1 4 0" stroke="#000" stroke-width="1.5" fill="none"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>`
            },
            {
                class: 'neutral',
                value: 'neutral',
                svg: `<svg class="svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15" stroke="#000" stroke-width="1.5"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>`
            },
            {
                class: 'super-sad',
                value: 'super-sad',
                svg: `<svg class="svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 15c1.333-1 2.667-1 4 0" stroke="#000" stroke-width="1.5" fill="none"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>`
            }
        ];

        // Получаем сохранённый рейтинг
        const savedRating = getRating(messageId);

        ratings.forEach(rating => {
            const label = document.createElement('label');
            label.className = rating.class;

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `rating-${messageId}`;
            input.value = rating.value;
            input.className = rating.class;
            if (savedRating === rating.value) input.checked = true;

            label.appendChild(input);
            label.innerHTML += rating.svg;
            radios.appendChild(label);
        });

        ratingForm.appendChild(radios);
        ratingContainer.appendChild(ratingForm);

        // Обработчик изменения рейтинга
        ratingForm.addEventListener('change', (e) => {
            const rating = e.target.value;
            saveRating(messageId, rating);
        });

        return ratingContainer;
    }

    // Создаем карту ключевых слов и их синонимов/связанных терминов
    const keywordMap = {
        // SEO и продвижение
        'seo': ['seo', 'сео', 'продвижение', 'оптимизация', 'поисковой', 'поисковая', 'поисковое', 'раскрутка', 'яндекс', 'google', 'гугл'],
        'продвижение': ['seo', 'сео', 'продвижение', 'оптимизация', 'поисковой', 'поисковая', 'поисковое', 'раскрутка', 'яндекс', 'google', 'гугл'],
        
        // Чат-боты и разработка ботов
        'бот': ['бот', 'ботов', 'чат-бот', 'чатбот', 'telegram', 'телеграм', 'телеграмм', 'tg', 'whatsapp', 'вотсап', 'ватсап'],
        'чат': ['бот', 'ботов', 'чат-бот', 'чатбот', 'telegram', 'телеграм', 'телеграмм', 'tg', 'whatsapp', 'вотсап', 'ватсап'],
        'telegram': ['telegram', 'телеграм', 'телеграмм', 'tg', 'бот', 'ботов', 'чат-бот', 'чатбот'],
        
        // Разработка сайтов
        'сайт': ['сайт', 'сайта', 'сайтов', 'лендинг', 'landing', 'веб-сайт', 'вебсайт', 'интернет-магазин', 'tilda', 'тильда', 'тильды', 'тильду', 'тильде'],
        'разработка': ['разработка', 'создание', 'делать', 'сделать', 'программирование', 'программист', 'верстка'],
        'дизайн': ['дизайн', 'дизайнер', 'дизайна', 'оформление', 'стиль', 'визуал', 'ui', 'ux'],
        
        // Тильда - расширяем варианты для всех возможных форм слова
        'тильда': ['tilda', 'тильда', 'тильды', 'тильде', 'тильду', 'тильдой', 'конструктор', 'сайт'],
        'tilda': ['tilda', 'тильда', 'тильды', 'тильде', 'тильду', 'тильдой', 'конструктор', 'сайт'],
        
        // Маркетинг
        'маркетинг': ['маркетинг', 'маркетолог', 'продвижение', 'реклама', 'продажи', 'трафик', 'лиды'],
        'таргет': ['таргет', 'таргетинг', 'таргетолог', 'реклама', 'ads', 'advert', 'рекламный', 'кабинет'],
        
        // Дизайн
        'логотип': ['логотип', 'лого', 'фирменный', 'стиль', 'брендинг', 'айдентика', 'дизайн']
    };

    // Функция для фильтрации сообщений по релевантности
    function filterMessagesByRelevance(messages, query) {
        console.log('Начинаем фильтрацию сообщений. Всего сообщений:', messages ? messages.length : 0);
        
        // Проверка на пустые данные
        if (!messages || messages.length === 0) {
            console.error('Нет сообщений для фильтрации!');
            return [];
        }
        
        // Преобразуем запрос и сообщения в нижний регистр для сравнения
        const queryLower = query.toLowerCase();
        
        // Проверка на прямое совпадение с ключевыми словами (для коротких запросов)
        if (queryLower.includes('тильда') || queryLower.includes('tilda')) {
            console.log('Прямое совпадение с ключевым словом "тильда/tilda"');
            return messages.filter(message => {
                if (!message || !message.text) return false;
                const messageLower = message.text.toLowerCase();
                return messageLower.includes('тильда') || messageLower.includes('tilda');
            });
        }
        
        // Подготовка запроса - разбиваем на слова и убираем стоп-слова
        const queryWords = queryLower.split(/\s+/).filter(word => {
            // Отфильтровываем слишком короткие слова и стоп-слова
            if (word.length < 3) return false;
            if (['и', 'в', 'на', 'с', 'для', 'не', 'по', 'от', 'к', 'за', 'из', 'под', 'над', 'или', 'бы', 'же', 'как', 'что', 'кто', 'они', 'мне', 'меня', 'нас', 'вас', 'его', 'ее', 'их', 'этот', 'эта', 'это', 'эти', 'тот', 'та', 'то', 'те'].includes(word)) return false;
            return true;
        });
        
        console.log('Ключевые слова из запроса:', queryWords);

        // Создаем карту ключевых слов и их синонимов/связанных терминов
        const keywordMap = {
            // SEO и продвижение
            'seo': ['seo', 'сео', 'продвижение', 'оптимизация', 'поисковой', 'поисковая', 'поисковое', 'раскрутка', 'яндекс', 'google', 'гугл'],
            'продвижение': ['seo', 'сео', 'продвижение', 'оптимизация', 'поисковой', 'поисковая', 'поисковое', 'раскрутка', 'яндекс', 'google', 'гугл'],
            
            // Чат-боты и разработка ботов
            'бот': ['бот', 'ботов', 'чат-бот', 'чатбот', 'telegram', 'телеграм', 'телеграмм', 'tg', 'whatsapp', 'вотсап', 'ватсап'],
            'чат': ['бот', 'ботов', 'чат-бот', 'чатбот', 'telegram', 'телеграм', 'телеграмм', 'tg', 'whatsapp', 'вотсап', 'ватсап'],
            'telegram': ['telegram', 'телеграм', 'телеграмм', 'tg', 'бот', 'ботов', 'чат-бот', 'чатбот'],
            
            // Разработка сайтов
            'сайт': ['сайт', 'сайта', 'сайтов', 'лендинг', 'landing', 'веб-сайт', 'вебсайт', 'интернет-магазин', 'tilda', 'тильда', 'тильды', 'тильду', 'тильде'],
            'разработка': ['разработка', 'создание', 'делать', 'сделать', 'программирование', 'программист', 'верстка'],
            'дизайн': ['дизайн', 'дизайнер', 'дизайна', 'оформление', 'стиль', 'визуал', 'ui', 'ux'],
            
            // Тильда - расширяем варианты для всех возможных форм слова
            'тильда': ['tilda', 'тильда', 'тильды', 'тильде', 'тильду', 'тильдой', 'конструктор', 'сайт'],
            'tilda': ['tilda', 'тильда', 'тильды', 'тильде', 'тильду', 'тильдой', 'конструктор', 'сайт'],
            
            // Маркетинг
            'маркетинг': ['маркетинг', 'маркетолог', 'продвижение', 'реклама', 'продажи', 'трафик', 'лиды'],
            'таргет': ['таргет', 'таргетинг', 'таргетолог', 'реклама', 'ads', 'advert', 'рекламный', 'кабинет'],
            
            // Дизайн
            'логотип': ['логотип', 'лого', 'фирменный', 'стиль', 'брендинг', 'айдентика', 'дизайн']
        };
        
        // Определяем категорию запроса на основе ключевых слов
        const queryCategories = [];
        queryWords.forEach(word => {
            for (const [category, keywords] of Object.entries(keywordMap)) {
                if (keywords.some(keyword => word.includes(keyword))) {
                    if (!queryCategories.includes(category)) {
                        queryCategories.push(category);
                    }
                }
            }
        });
        
        // Фильтруем сообщения по категориям и ключевым словам
        return messages.filter(message => {
            if (!message || !message.text) return false;
            
            const messageLower = message.text.toLowerCase();
            
            // Если определены категории запроса, ищем совпадения по ним
            if (queryCategories.length > 0) {
                return queryCategories.some(category => {
                    const relatedKeywords = keywordMap[category] || [];
                    return relatedKeywords.some(keyword => messageLower.includes(keyword));
                });
            }
            
            // Если категории не определены, ищем совпадения по словам запроса
            return queryWords.some(word => {
                // Ищем полное слово или его корень (с учетом возможных префиксов/суффиксов)
                return messageLower.includes(word);
            });
        });
    }

    // --- ОТОБРАЖЕНИЕ ТОЛЬКО ПЕРВЫХ 10 СООБЩЕНИЙ ---
    function displayMessages(messages) {
        console.log('Начало отображения сообщений:', messages);
        
        if (!tableBody || !tableContainer) {
            console.error('ОШИБКА: Таблица не найдена!');
            return;
        }
        
        tableBody.innerHTML = '';
        const toShow = messages.slice(0, 10);
        console.log('Сообщения для отображения:', toShow);
        
        if (!toShow || toShow.length === 0) {
            console.log('Нет сообщений для отображения');
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 2;
            cell.textContent = 'Ничего не найдено';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            tableBody.appendChild(row);
        } else {
            console.log('Отображаем сообщения');
            toShow.forEach((message, index) => {
                console.log('Обработка сообщения:', message);
                const row = document.createElement('tr');
                // Ячейка с текстом сообщения
                const textCell = document.createElement('td');
                const messageText = message.text || message.message;
                console.log('Текст сообщения:', messageText);
                textCell.textContent = sanitizeAndValidateInput(messageText);
                row.appendChild(textCell);
                // Ячейка с рейтингом
                const ratingCell = document.createElement('td');
                ratingCell.className = 'rating-cell';
                // Используем интерактивный компонент рейтинга
                ratingCell.appendChild(createRatingComponent(message.id || index));
                row.appendChild(ratingCell);
                tableBody.appendChild(row);
            });
        }
        
        console.log('Показываем таблицу');
        tableContainer.style.display = 'block';
        tableContainer.style.visibility = 'visible';
        tableContainer.style.opacity = '1';
        
        // Удаляем пагинацию, если она была
        let pagBlock = document.querySelector('.pagination');
        if (pagBlock) pagBlock.remove();
    }

    // --- Поиск с учётом пагинации ---
    searchButton.addEventListener('click', async function() {
        console.log('Кнопка поиска нажата');
        const rawQuery = searchInput.value.trim();
        console.log('Введенный запрос:', rawQuery);
        
        const query = sanitizeAndValidateInput(rawQuery);
        console.log('Обработанный запрос:', query);
        
        if (query.length < 3) {
            console.log('Запрос слишком короткий');
            errorMessageElement.textContent = 'Пожалуйста, введите минимум 3 символа для поиска';
            errorMessageElement.classList.add('visible');
            return;
        }
        
        console.log('Подготовка к отправке запроса');
        tableContainer.style.display = 'block';
        tableBody.innerHTML = '';
        errorMessageElement.classList.remove('visible');

        try {
            console.log('Отправляем запрос на API:', {
                url: 'https://api.leadlbot.com/v1/telegram/search',
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: {
                    query: query,
                    limit: 25
                }
            });
            
            const response = await fetch('https://api.leadlbot.com/v1/telegram/search', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    limit: 25
                })
            });

            console.log('Получен ответ от API:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Полученные данные:', data);
            
            if (!data || !Array.isArray(data)) {
                console.error('Некорректный формат данных:', data);
                errorMessageElement.textContent = 'Получены некорректные данные от сервера';
                errorMessageElement.classList.add('visible');
                return;
            }
            
            console.log('Отображаем результаты:', data.length, 'сообщений');
            displayMessages(data);
        } catch (error) {
            console.error('Ошибка при выполнении поиска:', error);
            errorMessageElement.textContent = 'Произошла ошибка при поиске. Пожалуйста, попробуйте позже.';
            errorMessageElement.classList.add('visible');
        }
    });

    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            searchButton.click();
        }
        if (errorMessageElement && errorMessageElement.classList.contains('visible')) {
            errorMessageElement.textContent = '';
            errorMessageElement.classList.remove('visible');
        }
    });

    // Функция для санитизации и валидации ввода
    function sanitizeAndValidateInput(input) {
        // Базовые проверки
        if (typeof input !== 'string') {
            console.error('Invalid input type:', typeof input);
            return '';
        }

        // Удаляем потенциально опасные символы
        let sanitized = input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        // Проверка на максимальную длину
        const MAX_LENGTH = 1000;
        if (sanitized.length > MAX_LENGTH) {
            console.warn('Input exceeded maximum length');
            sanitized = sanitized.substring(0, MAX_LENGTH);
        }

        // Проверка на наличие потенциально опасных паттернов
        const dangerousPatterns = [
            /javascript:/i,
            /data:/i,
            /vbscript:/i,
            /on\w+=/i
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(sanitized)) {
                console.warn('Potentially dangerous pattern detected');
                sanitized = sanitized.replace(pattern, '');
            }
        }

        return sanitized;
    }

    // Функция для создания таблицы с данными
    function createTable(data) {
        const tableContainer = document.getElementById('tableContainer');
        tableContainer.innerHTML = ''; // Очищаем контейнер

        const table = document.createElement('table');
        table.className = 'invoice-table';
        table.id = 'invoiceTable';

        // Создаем заголовок таблицы
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Сообщение</th>
            </tr>
        `;
        table.appendChild(thead);

        // Создаем тело таблицы
        const tbody = document.createElement('tbody');
        data.forEach((item) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.message}</td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        // Добавляем таблицу в контейнер
        tableContainer.appendChild(table);
    }

    // Функция для загрузки данных
    async function loadData() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts');
            const data = await response.json();
            return data.map(item => ({
                message: item.body
            }));
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            return [];
        }
    }

    // Функция инициализации
    async function initialize() {
        // Загружаем все сообщения (или используем уже загруженные)
        if (!jsonDataLoaded) {
            loadMessagesFromJSON();
        }
        // Ждём загрузки данных (если асинхронно)
        setTimeout(() => {
            displayMessages(allMessagesFromJSON);
        }, 1000);
    }

    // Запускаем инициализацию при загрузке страницы
    document.addEventListener('DOMContentLoaded', initialize);

    // Функция для сохранения рейтинга
    function saveRating(messageId, rating) {
        const ratings = JSON.parse(localStorage.getItem('messageRatings') || '{}');
        ratings[messageId] = rating;
        localStorage.setItem('messageRatings', JSON.stringify(ratings));
    }

    // Функция для получения рейтинга
    function getRating(messageId) {
        const ratings = JSON.parse(localStorage.getItem('messageRatings') || '{}');
        return ratings[messageId] || null;
    }

    // Модифицируем функцию createResultsTable
    function createResultsTable(results) {
        const table = document.createElement('table');
        table.className = 'results-table';
        
        // Создаем заголовок таблицы
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Сообщение', 'Рейтинг'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Создаем тело таблицы
        const tbody = document.createElement('tbody');
        
        results.forEach(result => {
            const row = document.createElement('tr');
            
            // Ячейка с сообщением
            const messageCell = document.createElement('td');
            messageCell.textContent = result.message;
            row.appendChild(messageCell);
            
            // Ячейка с рейтингом
            const ratingCell = document.createElement('td');
            ratingCell.className = 'rating-cell';
            const ratingComponent = createRatingComponent(result.id);
            ratingCell.appendChild(ratingComponent);
            
            // Устанавливаем сохраненный рейтинг, если он есть
            const savedRating = getRating(result.id);
            if (savedRating) {
                const radio = ratingComponent.querySelector(`input[value="${savedRating}"]`);
                if (radio) radio.checked = true;
            }
            
            row.appendChild(ratingCell);
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        return table;
    }
}); 