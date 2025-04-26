// Простая функция assert
function assert(condition, message) {
    if (!condition) throw new Error(message);
}

// --- Тесты для sanitizeAndValidateInput ---
function testSanitizeAndValidateInput() {
    const fn = window.sanitizeAndValidateInput || sanitizeAndValidateInput;
    assert(fn('<script>alert(1)</script>') === '&lt;script&gt;alert(1)&lt;/script&gt;', 'sanitize: XSS');
    assert(fn('hello & world') === 'hello &amp; world', 'sanitize: &');
    assert(fn('"test"') === '&quot;test&quot;', 'sanitize: "');
    assert(fn("'test'") === '&#039;test&#039;', "sanitize: '");
    assert(fn('a'.repeat(2000)).length === 1000, 'sanitize: max length');
    console.log('sanitizeAndValidateInput: OK');
}

// --- Тесты для validateMessageStructure ---
function testValidateMessageStructure() {
    const fn = window.validateMessageStructure || validateMessageStructure;
    assert(fn({text: 'hi', category: 'develop', rating: 3}) === true, 'validate: valid');
    assert(fn({text: '', category: 'develop', rating: 3}) === false, 'validate: empty text');
    assert(fn({text: 'hi', category: '', rating: 3}) === false, 'validate: empty category');
    assert(fn({text: 'hi', category: 'develop', rating: 0}) === false, 'validate: rating < 1');
    assert(fn({text: 'hi', category: 'develop', rating: 6}) === false, 'validate: rating > 5');
    console.log('validateMessageStructure: OK');
}

// --- Тесты для filterMessagesByRelevance ---
function testFilterMessagesByRelevance() {
    const fn = window.filterMessagesByRelevance || filterMessagesByRelevance;
    const data = [
        {text: 'Ищу дизайнера на тильде', category: 'develop', rating: 4},
        {text: 'Маркетинг и реклама', category: 'marketing', rating: 5},
        {text: 'Разработка сайтов', category: 'develop', rating: 3},
    ];
    let res = fn(data, 'тильда');
    assert(res.length === 1 && res[0].text.includes('тильде'), 'filter: тильда');
    res = fn(data, 'маркетинг');
    assert(res.length === 1 && res[0].category === 'marketing', 'filter: маркетинг');
    res = fn(data, 'разработка');
    assert(res.length === 1 && res[0].text.includes('Разработка'), 'filter: разработка');
    res = fn(data, 'несуществующий');
    assert(res.length === 0, 'filter: no match');
    console.log('filterMessagesByRelevance: OK');
}

// --- Запуск всех тестов ---
function runAllTests() {
    try {
        testSanitizeAndValidateInput();
        testValidateMessageStructure();
        testFilterMessagesByRelevance();
        console.log('%cВсе тесты пройдены успешно!', 'color: green; font-weight: bold;');
    } catch (e) {
        console.error('Тест не пройден:', e.message);
    }
}

// Для запуска в браузере:
window.runAllTests = runAllTests;
// Для Node.js (если потребуется):
if (typeof module !== 'undefined') module.exports = { runAllTests }; 