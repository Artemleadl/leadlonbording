// Полностью восстановленный скрипт с интеграцией базы данных

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event - скрипт запущен');
    
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

    console.log('Найдены элементы:', { 
        'Поле ввода': !!searchInput, 
        'Кнопка поиска': !!searchButton,
        'Элемент ошибки': !!errorMessageElement,
        'Тело таблицы': !!tableBody,
        'Контейнер таблицы': !!tableContainer,
        'Карточки цен': !!priceCards
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

    // Скрываем таблицу при загрузке страницы
    tableContainer.style.display = 'none';
    
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
    
    // Функция для загрузки данных из JSON файла
    function loadMessagesFromJSON() {
        console.log('Загрузка данных из JSON файла... Попытка #' + (++jsonLoadAttempts));
        
        // Пробуем загрузить данные из JSON
        try {
            // Сначала пробуем fetch API
            if (window.fetch) {
                console.log('Используем fetch API для загрузки JSON');
                fetch('data/messages.json')
                    .then(response => {
                        console.log('Fetch response status:', response.status);
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log(`Успешно загружено ${data.length} сообщений из JSON через fetch`);
                        allMessagesFromJSON = data;
                        jsonDataLoaded = true;
                        
                        // Выводим первые 3 сообщения для проверки
                        console.log('Примеры загруженных сообщений (fetch):');
                        data.slice(0, 3).forEach((msg, i) => {
                            console.log(`${i + 1}. ${msg.text.substring(0, 100)}...`);
                        });
                    })
                    .catch(error => {
                        console.error('Ошибка при загрузке через fetch:', error);
                        // Если fetch не сработал, пробуем XMLHttpRequest
                        loadWithXHR();
                    });
            } else {
                // Если fetch недоступен, используем XMLHttpRequest
                console.log('Fetch API недоступен, используем XMLHttpRequest');
                loadWithXHR();
            }
        } catch (error) {
            console.error('Критическая ошибка при загрузке данных:', error);
            console.log('Не удалось загрузить данные из JSON');
        }
    }
    
    // Загрузка с использованием XMLHttpRequest
    function loadWithXHR() {
        console.log('Загрузка с использованием XMLHttpRequest');
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'data/messages.json', true);
        
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
                console.error('Путь запроса:', 'data/messages.json');
                // Пробуем загрузить из альтернативного пути
                tryAlternativePath();
            }
        };
        
        xhr.onerror = function(e) {
            console.error('Ошибка сети при загрузке JSON:', e);
            console.error('Путь запроса:', 'data/messages.json');
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
            'messages.json'
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

    // Функция для создания звезд рейтинга
    function createRatingStars(messageId) {
        let starsHtml = `<div class="rating">`;
        for (let i = 5; i >= 1; i--) {
            starsHtml += `
                <input type="radio" id="star${i}-${messageId}" name="rating-${messageId}" value="${i}" />
                <label for="star${i}-${messageId}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
                </label>
            `;
        }
        starsHtml += `</div>`;
        return starsHtml;
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

    // Изменяем функцию отображения сообщений
    function displayMessages(messages) {
        // Если таблица не найдена, прекращаем выполнение
        if (!tableBody || !tableContainer) {
            console.error('Элементы таблицы не найдены');
            return;
        }
        
        console.log(`Отображение ${messages.length} сообщений в таблице`);
        
        // Очищаем таблицу
        tableBody.innerHTML = '';
        
        // Если нет сообщений, показываем сообщение об отсутствии результатов
        if (messages.length === 0) {
            console.log('Нет результатов для отображения');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="2" style="text-align: center; padding: 20px;">
                    Нет результатов по вашему запросу
                </td>
            `;
            tableBody.appendChild(row);
        } else {
            console.log(`Добавляем ${messages.length} сообщений в таблицу`);
            // Добавляем сообщения в таблицу
            messages.forEach((message, index) => {
                const row = document.createElement('tr');
                
                // Проверка на наличие текста сообщения
                const messageText = message && message.text ? message.text : 'Ошибка: текст сообщения отсутствует';
                
                console.log(`Сообщение ${index + 1}: ${messageText.substring(0, 50)}...`);
                
                row.innerHTML = `
                    <td>${messageText}</td>
                    <td>${createRatingStars(index + 1)}</td>
                `;
                tableBody.appendChild(row);
            });
        }
        
        // Таблица всегда видима
        tableContainer.style.display = 'block';
        
        // Оставляем видимыми и карточки цен
        if (priceCards) {
            priceCards.style.display = 'block';
            console.log('Карточки с ценами остаются видимыми');
        }
        
        console.log('Таблица с результатами отображена');
    }

    // Отображение сообщений в таблице
    function displayMessagesInTable(messages) {
        console.log(`Отображаем ${messages.length} сообщений в таблице`);
        
        // Очищаем таблицу
        tableBody.innerHTML = '';
        
        // Отображаем максимум 10 сообщений
        const messagesToShow = messages.slice(0, 10);
        
        // Добавляем сообщения в таблицу
        messagesToShow.forEach((message, index) => {
            const row = document.createElement('tr');
            
            // Создаем звезды рейтинга
            const ratingStars = createRatingStars(message.rating || 0);
            
            // Рейтинг формируем в отдельной ячейке
            const ratingCell = document.createElement('td');
            ratingCell.className = 'rating-cell';
            ratingCell.appendChild(ratingStars);
            
            // Текст сообщения
            const textCell = document.createElement('td');
            textCell.className = 'message-text';
            textCell.textContent = message.text;
            
            // Добавляем ячейки в строку
            row.appendChild(ratingCell);
            row.appendChild(textCell);
            
            // Добавляем строку в таблицу
            tableBody.appendChild(row);
        });
        
        // Скрываем индикатор загрузки
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
    }

    // Обработчик клика по кнопке поиска или нажатия Enter
    searchButton.addEventListener('click', function() {
        console.log('Нажата кнопка поиска');
        
        // Скрываем предыдущую ошибку
        errorMessageElement.classList.remove('visible');
        
        // Проверяем, что введен текст в поиск
        const searchText = searchInput.value.trim();
        if (searchText.length < 15) {
            console.log('Введен слишком короткий запрос:', searchText);
            errorMessageElement.textContent = 'Пожалуйста, введите запрос длиной не менее 15 символов.';
            errorMessageElement.classList.add('visible');
            return;
        }
        
        console.log('Поисковый запрос:', searchText);
        
        // Отображаем индикатор загрузки
        if (loadingContainer) {
            loadingContainer.style.display = 'flex';
        }
        
        // Проверяем, загружены ли данные
        if (!jsonDataLoaded && jsonLoadAttempts < 3) {
            console.log('Данные не загружены, пробуем загрузить еще раз...');
            loadMessagesFromJSON();
            setTimeout(() => {
                // Повторно вызываем обработчик после повторной загрузки
                if (jsonDataLoaded) {
                    console.log('Данные успешно загружены, продолжаем поиск');
                    processSearch(searchText);
                } else {
                    console.error('Не удалось загрузить данные после повторной попытки');
                    errorMessageElement.textContent = 'Ошибка загрузки данных. Пожалуйста, обновите страницу.';
                    errorMessageElement.classList.add('visible');
                    if (loadingContainer) loadingContainer.style.display = 'none';
                }
            }, 2000); // Даем 2 секунды на загрузку
            return;
        }
        
        // Если данные все еще не загружены после повторных попыток, используем встроенный набор сообщений
        if (!jsonDataLoaded || allMessagesFromJSON.length === 0) {
            console.log('Используем встроенные сообщения, так как JSON не загрузился');
            allMessagesFromJSON = [
                { text: "Ищу разработчика для создания сайта на Тильде с нуля. Нужен лендинг с формой заявки и интеграцией оплаты. Бюджет 500€.", category: "develop", rating: 4 },
                { text: "Помогите сделать сайт на Тильде. Есть референсы, нужно сделать похожий, но с нашим брендом. Срок - 2 недели. Бюджет 250-300€.", category: "develop", rating: 3 },
                { text: "Хочу заказать лендинг на Тильде для продажи курсов по психологии. Нужны красивые анимации и интеграция с Getcourse. Бюджет до 400€.", category: "develop", rating: 5 },
                { text: "Требуется помощь с уже существующим сайтом на Тильде. Нужно исправить несколько багов и добавить функциональность. Готов заплатить 200€ за помощь.", category: "develop", rating: 4 },
                { text: "Ищу специалиста по Тильде для разработки онлайн-магазина. Нужны фильтры товаров, корзина, оплата. Бюджет 600-800€.", category: "develop", rating: 5 },
                { text: "Нужен сайт-визитка для компании на Тильде. Минималистичный дизайн, 5-7 страниц. Бюджет до 300€.", category: "develop", rating: 3 },
                { text: "Хочу заказать сайт для своего фотостудии на Тильде. 10 страниц, форма бронирования, галерея работ. Бюджет 450€.", category: "develop", rating: 4 },
                { text: "Нужен лендинг для event-агентства на Тильде. Важен красивый дизайн и анимации. Бюджет до 500€.", category: "develop", rating: 5 },
                { text: "Ищу разработчика Тильды для создания сайта для юриста. Строгий дизайн, форма записи на консультацию. Бюджет 350€.", category: "develop", rating: 4 },
                { text: "Нужно сделать сайт для ресторана на Тильде. Меню, бронирование столиков, отзывы. Бюджет 400-500€.", category: "develop", rating: 5 }
            ];
            jsonDataLoaded = true;
        }
        
        processSearch(searchText);
    });
    
    // Функция обработки поиска
    function processSearch(searchText) {
        // Фильтруем релевантные сообщения
        const relevantMessages = filterMessagesByRelevance(allMessagesFromJSON, searchText);
        console.log(`Найдено ${relevantMessages.length} релевантных сообщений`);
        
        // Скрываем индикатор загрузки
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
        
        // Проверяем, есть ли релевантные сообщения
        if (relevantMessages.length === 0) {
            // Если нет релевантных сообщений, проверяем, есть ли запрос связан с Тильдой
            if (searchText.toLowerCase().includes('тильд') || searchText.toLowerCase().includes('tild')) {
                console.log('Запрос связан с Тильдой, ищем сообщения только по этому ключевому слову');
                const tildaMessages = allMessagesFromJSON.filter(msg => 
                    msg.text && (msg.text.toLowerCase().includes('тильд') || msg.text.toLowerCase().includes('tild'))
                );
                
                if (tildaMessages.length > 0) {
                    displayMessagesInTable(tildaMessages.slice(0, 10));
                    tableContainer.style.display = 'block';
                    if (priceCards) priceCards.style.display = 'none';
                    return;
                }
            }
            
            console.log('Нет релевантных сообщений для отображения');
            errorMessageElement.textContent = 'Нет результатов, соответствующих вашему запросу. Пожалуйста, используйте другие ключевые слова.';
            errorMessageElement.classList.add('visible');
            tableContainer.style.display = 'none';
            if (priceCards) priceCards.style.display = 'block';
            return;
        }
        
        // Отображаем релевантные сообщения в таблице
        displayMessagesInTable(relevantMessages);
        
        // Показываем таблицу и скрываем карточки с ценами
        tableContainer.style.display = 'block';
        if (priceCards) priceCards.style.display = 'none';
    }

    // Добавляем обработку нажатия Enter в поле поиска
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            console.log('Нажата клавиша Enter в поле поиска');
            // Исправляем ошибку с handleSearch - вызываем клик по кнопке поиска
            searchButton.click();
        }
        
        if (errorMessageElement && errorMessageElement.classList.contains('visible')) {
            errorMessageElement.textContent = '';
            errorMessageElement.classList.remove('visible');
        }
    });
}); 