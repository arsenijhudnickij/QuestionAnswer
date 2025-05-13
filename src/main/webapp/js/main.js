let cachedQuestionsMap = {};
let answerModal = null;

document.addEventListener('DOMContentLoaded', async () => {
    await fetchRandomQuestions();
    initializeAnswerModal();
    setupSearchHandlers();
});

async function fetchRandomQuestions() {
    const container = document.getElementById('random-questions-list');
    container.innerHTML = '<div class="loading">Загрузка вопросов...</div>';

    try {
        const response = await fetch('/questions/random?count=8', {
            headers: { 'Accept': 'application/json; charset=utf-8' }
        });

        if (!response.ok) throw new Error('Ошибка сервера: ' + response.status);

        const questions = await response.json();
        container.innerHTML = '';

        if (!questions || questions.length === 0) {
            container.innerHTML = '<div class="error">Вопросы не найдены</div>';
            return;
        }

        questions.forEach(question => {
            const questionId = question.questionId || question.id;
            cachedQuestionsMap[questionId] = question;
            renderQuestionCard(container, question);
        });

    } catch (error) {
        console.error('Ошибка при загрузке вопросов:', error);
        container.innerHTML = '<div class="error">Ошибка при загрузке вопросов</div>';
    }
}

function renderQuestionCard(container, question) {
    const questionId = question.questionId || question.id;
    const card = document.createElement('div');
    card.className = 'question-card';

    const questionText = document.createElement('div');
    questionText.className = 'question-text';
    questionText.textContent = question.text || 'Без текста';

    const meta = document.createElement('div');
    meta.className = 'question-meta';

    const theme = document.createElement('div');
    theme.className = 'meta-item';

    const themeDisplayName = getThemeDisplayName(question.theme);
    theme.textContent = 'Тема: ' + (themeDisplayName || 'Не указана');

    const author = document.createElement('div');
    author.className = 'meta-item';
    const userName = (question.user && question.user.fullName) ? question.user.fullName : 'Аноним';
    author.textContent = 'Автор: ' + userName;

    meta.appendChild(theme);
    meta.appendChild(author);

    const answersBtn = document.createElement('button');
    answersBtn.className = 'view-answers-btn';
    answersBtn.innerHTML = '<i class="fas fa-comments"></i> Ответы';
    answersBtn.dataset.questionId = questionId;
    answersBtn.addEventListener('click', () => showAnswerModal(questionId));

    card.appendChild(questionText);
    card.appendChild(meta);
    card.appendChild(answersBtn);
    container.appendChild(card);
}

function getThemeDisplayName(themeKey) {
    const themeMap = {
        'MATHS': 'Математика',
        'PHYSICS': 'Физика',
        'CHEMISTRY': 'Химия',
        'LANGUAGES': 'Языки',
        'HISTORY': 'История',
        'LITERATURE': 'Литература',
        'LIFE': 'Жизнь'
    };

    return themeMap[themeKey] || themeKey;
}

async function showAnswerModal(questionId) {
    currentQuestionId = questionId;
    const answersContainer = document.getElementById('answers-container');
    const modalQuestion = document.getElementById('modal-question');

    answersContainer.innerHTML = '<div class="loading">Загрузка ответов...</div>';
    answerModal.style.display = 'block';

    // Отображаем вопрос в модальном окне
    const question = cachedQuestionsMap[questionId];
    const themeDisplayName = getThemeDisplayName(question.theme);

    modalQuestion.innerHTML = `
        <h2>${question.text || 'Без текста'}</h2>
        <div class="question-meta">
            <div class="meta-item">Тема: ${themeDisplayName || 'Не указана'}</div>
            <div class="meta-item">Автор: ${(question.user && question.user.fullName) ? question.user.fullName : 'Аноним'}</div>
        </div>
    `;

    // Остальной код без изменений
    try {
        const response = await fetch(`/answers/question/${questionId}`, {
            headers: { 'Accept': 'application/json; charset=utf-8' }
        });

        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

        const answers = await response.json();
        renderAnswers(answersContainer, answers);
    } catch (error) {
        console.error(`Ошибка загрузки ответов:`, error);
        answersContainer.innerHTML = '<div class="error">Ошибка загрузки ответов</div>';
    }
}

function initializeAnswerModal() {
    answerModal = document.createElement('div');
    answerModal.className = 'modal';
    answerModal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close" onclick="closeAnswerModal()">&times;</span>
            <div id="modal-question" class="modal-question"></div>
            <div id="answers-container" class="answers-container"></div>
        </div>
    `;
    document.body.appendChild(answerModal);
}

let currentQuestionId = null;

function closeAnswerModal() {
    answerModal.style.display = 'none';
    currentQuestionId = null;
}

function renderAnswers(container, answers) {
    container.innerHTML = '';

    if (!answers || answers.length === 0) {
        container.innerHTML = '<div class="no-answers">Ответов пока нет</div>';
        return;
    }

    answers.forEach(answer => {
        const answerCard = document.createElement('div');
        answerCard.className = 'answer-card';

        const answerHeader = document.createElement('div');
        answerHeader.className = 'answer-header';

        const authorAvatar = document.createElement('div');
        authorAvatar.className = 'author-avatar';
        authorAvatar.innerHTML = '<i class="fas fa-user"></i>';

        const authorInfo = document.createElement('div');
        authorInfo.className = 'author-info';

        const authorName = document.createElement('div');
        authorName.className = 'author-name';
        authorName.textContent = answer.authorName || 'Аноним';

        const answerRating = document.createElement('div');
        answerRating.className = 'answer-rating';
        answerRating.textContent = `Рейтинг: ${answer.rating || 0}`;

        authorInfo.appendChild(authorName);
        authorInfo.appendChild(answerRating);

        answerHeader.appendChild(authorAvatar);
        answerHeader.appendChild(authorInfo);

        const answerText = document.createElement('div');
        answerText.className = 'answer-text';
        answerText.textContent = answer.text || 'Текст ответа отсутствует';

        const answerFooter = document.createElement('div');
        answerFooter.className = 'answer-footer';

        const authorStatus = document.createElement('div');
        authorStatus.className = 'author-status';
        authorStatus.textContent = answer.authorStatus || 'Пользователь';

        answerFooter.appendChild(authorStatus);

        answerCard.appendChild(answerHeader);
        answerCard.appendChild(answerText);
        answerCard.appendChild(answerFooter);
        container.appendChild(answerCard);
    });
}

function formatDate(dateString) {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function setupSearchHandlers() {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    function handleSearch() {
        const searchText = searchInput.value.trim();
        if (searchText) {
            searchQuestions(searchText);
        }
    }
}

async function searchQuestions(searchText) {
    const container = document.getElementById('random-questions-list');
    container.innerHTML = '<div class="loading">Поиск вопросов...</div>';

    try {
        const response = await fetch(`/questions/search?query=${encodeURIComponent(searchText)}`, {
            headers: { 'Accept': 'application/json; charset=utf-8' }
        });

        if (!response.ok) throw new Error('Ошибка сервера: ' + response.status);

        const questions = await response.json();
        container.innerHTML = '';

        if (!questions || questions.length === 0) {
            container.innerHTML = '<div class="error">Вопросы не найдены</div>';
            return;
        }

        cachedQuestionsMap = {};

        questions.forEach(question => {
            const questionId = question.questionId || question.id;
            cachedQuestionsMap[questionId] = question;
            renderQuestionCard(container, question);
        });

    } catch (error) {
        console.error('Ошибка при поиске вопросов:', error);
        container.innerHTML = '<div class="error">Ошибка при поиске вопросов</div>';
    }
}
