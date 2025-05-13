let currentUserIdQ = 0;
let currentUserIdCorrect = 0;
let cachedAnswersMap = {};
let editProfileModal = null;
let cachedQuestionsMap = {};
let answerModal = null;
let currentQuestionId = null;
let modal = null;
let modalMessage = null;
let redirectUrl = null;
let addAnswerModal = null;
let askQuestionModal = null;

document.addEventListener('DOMContentLoaded', async () => {
    await updateUserInfo();
    await fetchRandomQuestions();
    initializeAnswerModal();
    setupSearchHandlers();
    setupThemeHandlers();
    initializeMessageModal();
    document.getElementById('askQuestionBtn').addEventListener('click', showAskQuestionModal);
});

async function updateUserInfo() {
    const jwtToken = localStorage.getItem('jwtToken');
    const userDisplayName = document.getElementById('userDisplayName');
    const userDropdown = document.getElementById('userDropdown');

    if (jwtToken) {
        try {
            const payloadBase64 = jwtToken.split('.')[1];
            const payloadJson = atob(payloadBase64);
            const payload = JSON.parse(payloadJson);

            console.log("JWT payload:", payload);

            const username = payload.sub || 'Пользователь';
            currentUserIdQ = parseInt(payload.id, 10);
            if (!currentUserIdQ) {
                throw new Error("ID пользователя не найден в токене");
            }

            userDisplayName.textContent = username;

            userDropdown.innerHTML = `
                <a href="#" onclick="showMyInfo()"><i class="fas fa-user-circle"></i> Моя информация</a>
                <a href="#" onclick="showMyQuestions()"><i class="fas fa-question-circle"></i> Мои вопросы</a>
                <a href="#" onclick="showEditProfileForm()"><i class="fas fa-user-edit"></i> Изменить данные</a>
                <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Выйти</a>
                <a href="#" onclick="deleteAccount()" class="danger"><i class="fas fa-user-slash"></i> Удалить аккаунт</a>
            `;
            await loadPersonData();

        } catch (e) {
            console.error('Ошибка при обработке JWT:', e);
            showGuestMenu();
        }
    } else {
        showGuestMenu();
    }
}

async function showMyQuestions() {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            alert('Пожалуйста, войдите в систему');
            window.location.href = '/signin';
            return;
        }

        const currentUser = await loadPersonData();
        if (!currentUser) {
            throw new Error('Не удалось загрузить данные пользователя');
        }

        const user = await loadPersonInfo(currentUser.personId, jwtToken);
        const userId = user.userId;

        document.querySelector('.questions-title').textContent = 'Мои вопросы';

        const questionsResponse = await fetch(`/questions/by-user/${userId}`, {
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            }
        });

        if (!questionsResponse.ok) throw new Error('Ошибка получения вопросов');
        const questions = await questionsResponse.json();

        displayQuestions(questions);

    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при загрузке вопросов: ' + error.message);
    }
}

function displayQuestions(questions) {
    const container = document.getElementById('random-questions-list');
    container.innerHTML = '';

    if (!questions || questions.length === 0) {
        showModalMessage('Вопросы по вашему запросу не найдены. Показаны случайные вопросы.');
        fetchRandomQuestions();
        return;
    }

    questions.forEach(question => {
        const questionId = question.questionId || question.id;
        cachedQuestionsMap[questionId] = question;
        renderQuestionCard(container, question);
    });
}

async function loadPersonData() {
    try {
        const response = await fetch('/persons/me', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            }
        });

        if (!response.ok) throw new Error('Ошибка загрузки данных');

        return await response.json();
    } catch (error) {
        console.error('Ошибка:', error);
        return null;
    }
}

async function loadPersonInfo(personId, jwtToken) {
    try {
        const response = await fetch(`/users/by-person/${personId}`, {
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка получения данных пользователя');
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка при загрузке информации о пользователе:', error);
        throw error;
    }
}

async function showEditProfileForm() {
    const userData = await loadPersonData();
    if (!userData) {
        showModalMessage('Не удалось загрузить данные пользователя');
        return;
    }

    if (!editProfileModal) {
        editProfileModal = document.createElement('div');
        editProfileModal.id = 'editProfileModal';
        editProfileModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Редактирование профиля</h2>
                    <button class="close-btn" onclick="closeEditModal()">&times;</button>
                </div>
                <form id="profileEditForm">
                    <div class="form-group">
                        <label for="editName">Имя:</label>
                        <input type="text" id="editName" value="${userData.name || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editSurname">Фамилия:</label>
                        <input type="text" id="editSurname" value="${userData.surname || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Логин:</label>
                        <input type="text" value="${userData.login || ''}" disabled>
                    </div>
                    
                    <div class="form-group">
                        <label for="editEmail">Email:</label>
                        <input type="email" id="editEmail" value="${userData.email || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Дата рождения:</label>
                        <input type="text" value="${userData.birthdate ? new Date(userData.birthdate).toLocaleDateString() : 'Не указана'}" disabled>
                    </div>

                    <div class="form-group">
                        <label for="editPassword">Новый пароль (оставьте пустым, если не хотите менять):</label>
                        <input type="password" id="editPassword">
                    </div>
                    
                    <div class="form-group">
                        <label for="editPasswordConfirm">Подтвердите новый пароль:</label>
                        <input type="password" id="editPasswordConfirm">
                    </div>
                    
                    <div class="form-footer">
                        <button type="submit" class="submit-btn">Сохранить изменения</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(editProfileModal);

        document.getElementById('profileEditForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveProfileChanges();
        });
    }

    editProfileModal.style.display = 'block';
}

function closeEditModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function saveProfileChanges() {
    const name = document.getElementById('editName').value.trim();
    const surname = document.getElementById('editSurname').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const password = document.getElementById('editPassword').value;
    const passwordConfirm = document.getElementById('editPasswordConfirm').value;

    if (password && password !== passwordConfirm) {
        alert('Пароли не совпадают');
        return;
    }

    const currentUser = await loadPersonData();
    if (!currentUser) {
        alert('Не удалось загрузить текущие данные пользователя');
        return;
    }

    const updateData = {
        name: name,
        surname: surname,
        email: email,
        login: currentUser.login,
        birthdate: currentUser.birthdate,
        role: currentUser.role
    };

    if (password) {
        updateData.password = password;
    }

    try {
        const response = await fetch('/persons/' + currentUser.personId, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            alert('Данные успешно обновлены');

            closeEditModal();
            updateUserInfo().then(() => {
                fetchRandomQuestions();
            });
        } else {
            const errorData = await response.json().catch(() => ({}));
            alert(errorData.message || 'Ошибка при обновлении данных');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка соединения с сервером');
    }
}

async function deleteAccount() {
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
        alert('Токен отсутствует. Пожалуйста, войдите в систему.');
        return;
    }

    try {
        const meResponse = await fetch('/persons/me', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            }
        });

        if (!meResponse.ok) {
            throw new Error('Не удалось получить данные пользователя');
        }

        const currentUser = await meResponse.json();
        let currentUserId = currentUser.personId;

        const confirmed = confirm(`Вы уверены, что хотите удалить свой аккаунт (ID: ${currentUserId})? Это действие нельзя отменить.`);
        if (!confirmed) return;

        const response = await fetch(`/persons/${currentUserId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            localStorage.removeItem('jwtToken');
            alert('Аккаунт успешно удалён');
            window.location.href = '/';
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Ошибка при удалении аккаунта');
        }

    } catch (error) {
        console.error('Ошибка при удалении аккаунта:', error);
        alert('Ошибка: ' + error.message);
    }
}

function showGuestMenu() {
    const userDropdown = document.getElementById('userDropdown');
    userDropdown.innerHTML = `
        <a href="/signin"><i class="fas fa-sign-in-alt"></i> Войти</a>
        <a href="/signup"><i class="fas fa-user-plus"></i> Регистрация</a>
    `;
}

function logout() {
    localStorage.removeItem('jwtToken');
    currentUserIdQ = 0;
    updateUserInfo();
    window.location.href = '/';
}

async function fetchRandomQuestions() {
    const container = document.getElementById('random-questions-list');
    document.querySelector('.questions-title').textContent = 'Пример вопросов';
    container.innerHTML = '<div class="loading">Загрузка вопросов...</div>';

    try {
        const currentUser = await loadPersonData();
        const currentUserId = currentUser ? currentUser.personId : null;

        const url = currentUserId
            ? `/questions/random?count=8&excludeUserId=${currentUserId}`
            : '/questions/random?count=8';

        const response = await fetch(url, {
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

    const cardContent = document.createElement('div');
    cardContent.className = 'question-card-content';

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

    const actions = document.createElement('div');
    actions.className = 'question-actions';

    const answersBtn = document.createElement('button');
    answersBtn.className = 'view-answers-btn';
    answersBtn.innerHTML = '<i class="fas fa-comments"></i> Ответы';
    answersBtn.dataset.questionId = questionId;
    answersBtn.addEventListener('click', () => showAnswerModal(questionId));

    // Убрали кнопку удаления
    actions.appendChild(answersBtn);

    cardContent.appendChild(questionText);
    cardContent.appendChild(meta);
    card.appendChild(cardContent);
    card.appendChild(actions);
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

    const question = cachedQuestionsMap[questionId];
    const themeDisplayName = getThemeDisplayName(question.theme);

    modalQuestion.innerHTML = `
        <h2>${question.text || 'Без текста'}</h2>
        <div class="question-meta">
            <div class="meta-item">Тема: ${themeDisplayName || 'Не указана'}</div>
            <div class="meta-item">Автор: ${(question.user && question.user.fullName) ? question.user.fullName : 'Аноним'}</div>
        </div>
    `;

    try {
        const response = await fetch(`/answers/question/${questionId}`, {
            headers: { 'Accept': 'application/json; charset=utf-8' }
        });

        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

        const answers = await response.json();
        // Перемешиваем ответы перед отображением
        const shuffledAnswers = shuffleArray(answers);
        renderAnswers(answersContainer, shuffledAnswers);
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
            <div class="answers-actions">
                <button id="sort-answers-btn" class="action-btn">Сортировать по рейтингу</button>
                <button id="add-answer-btn" class="action-btn">Ответить</button>
            </div>
        </div>
    `;
    document.body.appendChild(answerModal);

    initializeAddAnswerModal();

    document.getElementById('add-answer-btn')?.addEventListener('click', () => {
        showAddAnswerModal(currentQuestionId);
    });

    document.getElementById('sort-answers-btn')?.addEventListener('click', () => {
        const answersContainer = document.getElementById('answers-container');
        const answers = Array.from(answersContainer.querySelectorAll('.answer-card'))
            .map(card => {
                return {
                    text: card.querySelector('.answer-text').textContent,
                    authorName: card.querySelector('.author-name').textContent,
                    rating: parseFloat(card.querySelector('.answer-rating').textContent.replace('Рейтинг: ', '')),
                    authorStatus: card.querySelector('.author-status').textContent
                };
            });

        // Сортируем по рейтингу (от высокого к низкому)
        answers.sort((a, b) => b.rating - a.rating);
        renderAnswers(answersContainer, answers);
    });
}

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
        // Возвращаем исходный формат рейтинга (может быть дробным)
        answerRating.textContent = `Рейтинг: ${answer.rating !== undefined ? answer.rating.toFixed(1) : '0.0'}`;

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
            searchInput.value = '';
        }
    }
}

async function searchQuestions(searchText) {
    const container = document.getElementById('random-questions-list');
    container.innerHTML = '<div class="loading">Поиск вопросов...</div>';
    document.querySelector('.questions-title').textContent = 'Результат поиска';
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        let userId = null;

        if (jwtToken) {
            try {
                const currentUser = await loadPersonData();
                if (currentUser) {
                    const user = await loadUserInfo(currentUser.personId, jwtToken);
                    userId = user.userId;
                }
            } catch (e) {
                console.error('Ошибка получения user_id:', e);
            }
        }

        // Формируем URL с параметрами поиска
        let url = `/questions/search?query=${encodeURIComponent(searchText)}`;

        // Добавляем параметр исключения, если пользователь авторизован
        if (userId) {
            url += `&excludeUserId=${userId}`;
        }

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json; charset=utf-8',
                ...(jwtToken ? { 'Authorization': 'Bearer ' + jwtToken } : {})
            }
        });

        if (!response.ok) throw new Error('Ошибка сервера: ' + response.status);

        const questions = await response.json();
        container.innerHTML = '';

        if (!questions || questions.length === 0) {
            showModalMessage('Вопросы по вашему запросу не найдены. Показаны случайные вопросы.');
            await fetchRandomQuestions(); // Загружаем случайные вопросы
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
        showModalMessage('Ошибка при поиске вопросов. Показаны случайные вопросы.');
        await fetchRandomQuestions(); // Загружаем случайные вопросы при ошибке
    }
}

function initializeMessageModal() {
    if (modal) return; // Уже инициализировано

    modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; text-align: center;">
            <span class="close" onclick="closeMessageModal()">&times;</span>
            <p id="modal-message-text" style="margin: 20px 0;"></p>
            <button onclick="closeMessageModal()" style="padding: 8px 16px;">OK</button>
        </div>
    `;
    document.body.appendChild(modal);

    modalMessage = document.getElementById('modal-message-text');
}

function showModalMessage(message, redirectAfter = null) {
    if (!modal) initializeMessageModal();

    modalMessage.textContent = message;
    redirectUrl = redirectAfter;
    modal.style.display = "block";
}

function closeMessageModal() {
    if (modal) {
        modal.style.display = "none";

        // Если вопросы не найдены, загружаем случайные вопросы после закрытия модального окна
        if (redirectUrl) {
            window.location.href = redirectUrl;
        } else if (modalMessage.textContent.includes('не найдены') ||
            modalMessage.textContent.includes('Ошибка')) {
            fetchRandomQuestions();
        }
    }
}

function initializeAddAnswerModal() {
    if (addAnswerModal) return;

    addAnswerModal = document.createElement('div');
    addAnswerModal.className = 'modal';
    addAnswerModal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close" onclick="closeAddAnswerModal()">&times;</span>
            <h2 id="answer-modal-title"></h2>
            <textarea id="answer-text" placeholder="Введите ваш ответ..." rows="5"></textarea>
            <button onclick="submitAnswer()" class="submit-answer-btn">Оставить ответ</button>
        </div>
    `;
    document.body.appendChild(addAnswerModal);
}

function showAddAnswerModal(questionId) {
    if (!questionId) return;

    const question = cachedQuestionsMap[questionId];
    if (!question) return;

    document.getElementById('answer-modal-title').textContent = question.text || 'Без текста';
    document.getElementById('answer-text').value = '';
    addAnswerModal.style.display = 'block';
}

function closeAddAnswerModal() {
    if (addAnswerModal) {
        addAnswerModal.style.display = 'none';
    }
}

async function submitAnswer() {
    const answerText = document.getElementById('answer-text').value.trim();
    const jwtToken = localStorage.getItem('jwtToken');

    if (!answerText) {
        showModalMessage('Пожалуйста, введите текст ответа');
        return;
    }

    if (!jwtToken) {
        showModalMessage('Для добавления ответа необходимо авторизоваться');
        window.location.href = '/signin';
        return;
    }

    try {
        const currentPerson = await loadPersonData();
        if (!currentPerson) {
            throw new Error('Не удалось загрузить данные пользователя');
        }
        const user = await loadPersonInfo(currentPerson.personId, jwtToken);
        const userId = user.userId;

        const response = await fetch('/answers', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: answerText,
                questionId: currentQuestionId,
                userId: userId
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Ошибка при добавлении ответа');
        }

        closeAddAnswerModal();
        showModalMessage('Ваш ответ успешно добавлен!');
        showAnswerModal(currentQuestionId);
    } catch (error) {
        console.error('Ошибка при добавлении ответа:', error);
        showModalMessage('Ошибка: ' + error.message);
    }
}

function initializeAskQuestionModal() {
    if (askQuestionModal) return;

    askQuestionModal = document.createElement('div');
    askQuestionModal.className = 'modal';
    askQuestionModal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeAskQuestionModal()">&times;</span>
            <h2 style="text-align: center;">Отправка вопроса</h2>
            <form id="ask-question-form">
                <div class="form-group">
                    <label for="question-text">Текст вопроса:</label>
                    <textarea id="question-text" placeholder="Введите ваш вопрос..." rows="5" required></textarea>
                </div>
                <div class="form-group">
                    <label for="question-theme">Тема:</label>
                    <select id="question-theme" required>
                        <option value="">Выберите тему</option>
                        <option value="MATHS">Математика</option>
                        <option value="PHYSICS">Физика</option>
                        <option value="CHEMISTRY">Химия</option>
                        <option value="LANGUAGES">Языки</option>
                        <option value="HISTORY">История</option>
                        <option value="LITERATURE">Литература</option>
                        <option value="LIFE">Жизнь</option>
                    </select>
                </div>
                <div class="form-group">
                    <button type="submit" class="submit-btn">Отправить вопрос</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(askQuestionModal);

    document.getElementById('ask-question-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitQuestion();
    });
}

function showAskQuestionModal() {
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
        showModalMessage('Для задавания вопросов необходимо авторизоваться');
        window.location.href = '/signin';
        return;
    }

    if (!askQuestionModal) {
        initializeAskQuestionModal();
    }

    // Очищаем поля при каждом открытии
    document.getElementById('question-text').value = '';
    document.getElementById('question-theme').value = '';
    askQuestionModal.style.display = 'block';
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function closeAskQuestionModal() {
    if (askQuestionModal) {
        askQuestionModal.style.display = 'none';
    }
}

async function submitQuestion() {
    const questionText = document.getElementById('question-text').value.trim();
    const questionTheme = document.getElementById('question-theme').value;
    const jwtToken = localStorage.getItem('jwtToken');

    if (!questionText) {
        showModalMessage('Пожалуйста, введите текст вопроса');
        return;
    }

    if (!questionTheme) {
        showModalMessage('Пожалуйста, выберите тему вопроса');
        return;
    }

    try {
        const currentPerson = await loadPersonData();
        if (!currentPerson) {
            throw new Error('Не удалось загрузить данные пользователя');
        }

        const user = await loadPersonInfo(currentPerson.personId, jwtToken);
        if (!user || !user.userId) {
            throw new Error('Не удалось получить ID пользователя');
        }

        console.log('Отправляемые данные:', {
            text: questionText,
            theme: questionTheme,
            userId: user.userId
        });

        const response = await fetch('/questions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: questionText,
                theme: questionTheme,
                userId: user.userId  // Изменено здесь - соответствует QuestionRequest
            })
        });

        console.log('Ответ сервера:', response);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Текст ошибки:', errorText);

            let errorMessage = 'Ошибка при добавлении вопроса';
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                console.error('Не удалось распарсить ошибку:', e);
            }

            throw new Error(errorMessage);
        }

        const responseData = await response.json();
        console.log('Успешный ответ:', responseData);

        closeAskQuestionModal();
        showModalMessage('Ваш вопрос успешно добавлен!');
        fetchRandomQuestions();
    } catch (error) {
        console.error('Полная ошибка:', error);
        showModalMessage('Ошибка: ' + error.message);
    }
}

function setupThemeHandlers() {
    const themeLinks = document.querySelectorAll('.theme-dropdown-content a');
    themeLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const theme = link.getAttribute('href').split('/').pop();
            await fetchQuestionsByTheme(theme);
        });
    });
}

async function fetchQuestionsByTheme(theme) {
    const container = document.getElementById('random-questions-list');
    const themeDisplayName = getThemeDisplayName(theme);
    document.querySelector('.questions-title').textContent = `Вопросы по теме: ${themeDisplayName}`;
    container.innerHTML = '<div class="loading">Загрузка вопросов...</div>';

    try {
        const jwtToken = localStorage.getItem('jwtToken');
        let userId = null;

        if (jwtToken) {
            try {
                const currentUser = await loadPersonData();
                if (currentUser) {
                    const user = await loadPersonInfo(currentUser.personId, jwtToken);
                    userId = user.userId;
                }
            } catch (e) {
                console.error('Ошибка получения user_id:', e);
            }
        }

        let url = `/questions/by-theme/${theme}`;
        if (userId) {
            url += `?excludeUserId=${userId}`;
        }

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json; charset=utf-8',
                ...(jwtToken ? { 'Authorization': 'Bearer ' + jwtToken } : {})
            }
        });

        if (!response.ok) throw new Error('Ошибка сервера: ' + response.status);

        const questions = await response.json();
        container.innerHTML = '';

        if (!questions || questions.length === 0) {
            container.innerHTML = '<div class="error">Вопросы по этой теме не найдены</div>';
            return;
        }

        cachedQuestionsMap = {};
        questions.forEach(question => {
            const questionId = question.questionId || question.id;
            cachedQuestionsMap[questionId] = question;
            renderQuestionCard(container, question);
        });

    } catch (error) {
        console.error('Ошибка при загрузке вопросов по теме:', error);
        container.innerHTML = '<div class="error">Ошибка при загрузке вопросов</div>';
    }
}

async function showMyInfo() {
    try {
        const existingModal = document.querySelector('.user-info-modal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }

        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            showModalMessage('Пожалуйста, войдите в систему');
            window.location.href = '/signin';
            return;
        }

        const personData = await loadPersonData();
        if (!personData) {
            throw new Error('Не удалось загрузить данные пользователя');
        }

        // Получаем данные пользователя
        const userResponse = await fetch(`/users/by-person/${personData.personId}`, {
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Accept': 'application/json'
            }
        });

        if (!userResponse.ok) {
            throw new Error('Не удалось загрузить информацию о пользователе');
        }

        const user = await userResponse.json();

        const answersResponse = await fetch(`/answers/user/${user.userId}`, {
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Accept': 'application/json'
            }
        });

        if (!answersResponse.ok) {
            throw new Error('Ошибка при загрузке ответов пользователя');
        }

        const answers = await answersResponse.json();

        const totalPoints = Math.round(answers.reduce((sum, answer) => sum + (answer.rating || 0), 0));

        const updateResponse = await fetch(`/users/${user.userId}/points?points=${totalPoints}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Content-Type': 'application/json'
            }
        });

        if (!updateResponse.ok) {
            throw new Error('Ошибка при обновлении рейтинга пользователя');
        }

        const updatedUser = await updateResponse.json();

        const birthdate = personData.birthdate ?
            new Date(personData.birthdate).toLocaleDateString() : 'Не указана';

        // Функция для перевода статуса
        const translateStatus = (status) => {
            const statusMap = {
                'STUDENT': 'Студент',
                'UNDERGRAND': 'Аспирант',
                'CONNOISSEUR': 'Знаток',
                'EXPERT': 'Эксперт',
                'SCIENTIST': 'Ученый',
                'MASTER': 'Мастер',
                'GENIUS': 'Гений'
            };
            return statusMap[status] || status;
        };

        // Создаем модальное окно
        const infoModal = document.createElement('div');
        infoModal.className = 'user-info-modal';
        infoModal.innerHTML = `
            <div class="user-info-modal__content">
                <button class="user-info-modal__close">&times;</button>
                <h2 class="user-info-modal__title">Моя информация</h2>
                <div class="user-info-modal__container">
                    <div class="user-info-modal__item">
                        <span class="user-info-modal__label">Имя:</span>
                        <span class="user-info-modal__value">${personData.name || 'Не указано'}</span>
                    </div>
                    <div class="user-info-modal__item">
                        <span class="user-info-modal__label">Фамилия:</span>
                        <span class="user-info-modal__value">${personData.surname || 'Не указано'}</span>
                    </div>
                    <div class="user-info-modal__item">
                        <span class="user-info-modal__label">Email:</span>
                        <span class="user-info-modal__value">${personData.email || 'Не указан'}</span>
                    </div>
                    <div class="user-info-modal__item">
                        <span class="user-info-modal__label">Дата рождения:</span>
                        <span class="user-info-modal__value">${birthdate}</span>
                    </div>
                    <div class="user-info-modal__item">
                        <span class="user-info-modal__label">Логин:</span>
                        <span class="user-info-modal__value">${personData.login || 'Не указан'}</span>
                    </div>
                    <div class="user-info-modal__item">
                        <span class="user-info-modal__label">Статус:</span>
                        <span class="user-info-modal__value">${translateStatus(updatedUser.status) || 'Не указан'}</span>
                    </div>
                    <div class="user-info-modal__item">
                        <span class="user-info-modal__label">Всего ответов:</span>
                        <span class="user-info-modal__value">${answers.length}</span>
                    </div>
                    <div class="user-info-modal__item">
                        <span class="user-info-modal__label">Общий рейтинг:</span>
                        <span class="user-info-modal__value">${updatedUser.points}</span>
                    </div>
                </div>
            </div>
        `;

        // Добавляем обработчики событий
        const closeBtn = infoModal.querySelector('.user-info-modal__close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(infoModal); // Полностью удаляем окно при закрытии
        });

        // Обновленный обработчик клика вне окна
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) {
                document.body.removeChild(infoModal); // Полностью удаляем окно
            }
        });

        document.body.appendChild(infoModal);
        infoModal.style.display = 'block';

        closeBtn.focus();

    } catch (error) {
        console.error('Ошибка при загрузке информации:', error);
        showModalMessage('Ошибка при загрузке информации: ' + error.message);

        // Удаляем модальное окно, если оно было создано
        const modal = document.querySelector('.user-info-modal');
        if (modal) {
            document.body.removeChild(modal);
        }
    }
}

async function fetchUserAnswers(userId, jwtToken) {
    try {
        const response = await fetch(`/answers/by-user/${userId}`, {
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Ошибка при загрузке ответов пользователя');
        }

        return await response.json();
    } catch (error) {
        console.error('Ошибка при загрузке ответов:', error);
        return [];
    }
}

function calculateTotalPoints(answers) {
    return answers.reduce((total, answer) => total + (answer.rating || 0), 0);
}

async function getStatusDisplayName(status) {
    try {
        if (status.displayName) {
            return status.displayName;
        }

        const statusMap = {
            'STUDENT': 'Студент',
            'UNDERGRAND': 'Аспирант',
            'CONNOISSEUR': 'Знаток',
            'EXPERT': 'Эксперт',
            'SCIENTIST': 'Ученый',
            'MASTER': 'Мастер',
            'GENIUS': 'Гений'
        };

        return statusMap[status] || status;
    } catch (e) {
        console.error('Ошибка при получении имени статуса:', e);
        return status;
    }
}

function calculateProgress(points) {
    const pointsToNextStatus = calculatePointsToNextStatus(points);
    const currentLevelPoints = getCurrentLevelPoints(points);
    return Math.min(100, Math.floor((points - currentLevelPoints) / (pointsToNextStatus / 100)));
}

function getCurrentLevelPoints(points) {
    if (points < 100) return 0;      // Студент
    if (points < 500) return 100;    // Аспирант
    if (points < 1000) return 500;   // Знаток
    if (points < 2500) return 1000;  // Эксперт
    if (points < 5000) return 2500;  // Ученый
    if (points < 10000) return 5000; // Мастер
    return 10000;                    // Гений
}

function calculatePointsToNextStatus(points) {
    if (points < 100) return 100 - points;       // До аспиранта
    if (points < 500) return 500 - points;       // До знатока
    if (points < 1000) return 1000 - points;     // До эксперта
    if (points < 2500) return 2500 - points;     // До ученого
    if (points < 5000) return 5000 - points;     // До мастера
    if (points < 10000) return 10000 - points;   // До гения
    return 0;                                    // Максимальный статус
}

window.showMyQuestions = showMyQuestions;
window.showEditProfileForm = showEditProfileForm;
window.logout = logout;
window.deleteAccount = deleteAccount;
window.closeEditModal = closeEditModal;
window.closeAnswerModal = closeAnswerModal;
window.closeMessageModal = closeMessageModal;