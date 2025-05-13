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
let currentPanel = 'questions';

document.addEventListener('DOMContentLoaded', async () => {
    await updateAdminUserInfo();
    await fetchRandomQuestions();
    initializeAnswerModal();
    setupSearchHandlers();
    initializeMessageModal();
    setupAdminControls();

    checkAuthStatus();
});

async function updateAdminUserInfo() {
    const jwtToken = localStorage.getItem('jwtToken');
    const userDisplayName = document.getElementById('userDisplayName');
    const userDropdown = document.getElementById('userDropdown');

    if (jwtToken) {
        try {
            const payloadBase64 = jwtToken.split('.')[1];
            const payloadJson = atob(payloadBase64);
            const payload = JSON.parse(payloadJson);

            console.log("JWT payload:", payload);

            const username = payload.sub || 'Администратор';
            currentUserIdQ = parseInt(payload.id, 10);
            if (!currentUserIdQ) {
                throw new Error("ID пользователя не найден в токене");
            }

            userDisplayName.textContent = username;

            userDropdown.innerHTML = `
                <a href="#" onclick="showEditProfileForm()"><i class="fas fa-user-edit"></i> Изменить данные</a>
                <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Выйти</a>
                <a href="#" onclick="deleteAdminAccount()" class="danger"><i class="fas fa-user-slash"></i> Удалить аккаунт</a>
            `;

        } catch (e) {
            console.error('Ошибка при обработке JWT:', e);
            showAdminGuestMenu();
        }
    } else {
        showAdminGuestMenu();
    }
}

async function fetchRandomQuestions() {
    const container = document.getElementById('questions-list');
    document.querySelector('.questions-title').textContent = 'Случайные вопросы';
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

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-question-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Удалить';
    deleteBtn.dataset.questionId = questionId;
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        confirmDeleteQuestion(questionId);
    });

    actions.appendChild(answersBtn);
    actions.appendChild(deleteBtn);

    cardContent.appendChild(questionText);
    cardContent.appendChild(meta);
    card.appendChild(cardContent);
    card.appendChild(actions);
    container.appendChild(card);
}

function confirmDeleteQuestion(questionId) {
    if (confirm('Вы уверены, что хотите удалить этот вопрос?')) {
        deleteQuestion(questionId);
    }
}

async function deleteQuestion(questionId) {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            showModalMessage('Для удаления вопросов необходимо авторизоваться');
            return;
        }

        const response = await fetch(`/questions/${questionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showModalMessage('Вопрос успешно удалён');
            fetchRandomQuestions();
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка при удалении вопроса');
        }
    } catch (error) {
        console.error('Ошибка при удалении вопроса:', error);
        showModalMessage('Ошибка: ' + error.message);
    }
}

function initializeAnswerModal() {
    answerModal = document.createElement('div');
    answerModal.id = 'answersModal'; // Добавлен ID
    answerModal.className = 'modal';
    answerModal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeAnswerModal()">&times;</span>
            <div id="modal-question" class="modal-question"></div>
            <div id="answers-container" class="answers-container"></div>
            <div class="answers-actions">
                <div class="rating-control">
                    <label for="answer-rating-slider">Рейтинг:</label>
                    <input type="range" id="answer-rating-slider" min="0" max="5" step="0.1" value="0">
                    <span id="rating-value">0.0</span>
                    <button id="set-rating-btn" class="action-btn">Установить рейтинг</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(answerModal);

    // Инициализация слайдера рейтинга
    const slider = document.getElementById('answer-rating-slider');
    const ratingValue = document.getElementById('rating-value');
    slider.addEventListener('input', () => {
        ratingValue.textContent = slider.value;
    });

    document.getElementById('set-rating-btn').addEventListener('click', setAnswerRating);
}

function closeAnswerModal() {
    if (answerModal) {
        answerModal.style.display = "none";
    }
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
        renderAnswers(answersContainer, answers);
    } catch (error) {
        console.error(`Ошибка загрузки ответов:`, error);
        answersContainer.innerHTML = '<div class="error">Ошибка загрузки ответов</div>';
    }
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
        answerCard.dataset.answerId = answer.answerId || answer.id;

        // Добавляем возможность выбора ответа
        answerCard.addEventListener('click', function() {
            document.querySelectorAll('.answer-card').forEach(card => {
                card.classList.remove('selected');
            });
            this.classList.add('selected');
            // Устанавливаем текущий рейтинг в слайдер
            document.getElementById('answer-rating-slider').value = answer.rating || 0;
            document.getElementById('rating-value').textContent = answer.rating ? answer.rating.toFixed(1) : '0.0';
        });

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

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-answer-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Удалить ответ';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Предотвращаем всплытие, чтобы не выбирать ответ при удалении
            confirmDeleteAnswer(answer.answerId || answer.id);
        });

        answerFooter.appendChild(deleteBtn);

        answerCard.appendChild(answerHeader);
        answerCard.appendChild(answerText);
        answerCard.appendChild(answerFooter);
        container.appendChild(answerCard);
    });
}

function confirmDeleteAnswer(answerId) {
    if (confirm('Вы уверены, что хотите удалить этот ответ?')) {
        deleteAnswer(answerId);
    }
}

async function deleteAnswer(answerId) {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            showModalMessage('Для удаления ответов необходимо авторизоваться');
            return;
        }

        const response = await fetch(`/answers/${answerId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showModalMessage('Ответ успешно удалён');
            showAnswerModal(currentQuestionId);
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка при удалении ответа');
        }
    } catch (error) {
        console.error('Ошибка при удалении ответа:', error);
        showModalMessage('Ошибка: ' + error.message);
    }
}

async function setAnswerRating() {
    const slider = document.getElementById('answer-rating-slider');
    const rating = parseFloat(slider.value);
    const answerId = getSelectedAnswerId();

    if (!answerId) {
        showModalMessage('Пожалуйста, выберите ответ для оценки');
        return;
    }

    if (isNaN(rating) || rating < 0 || rating > 5) {
        showModalMessage('Рейтинг должен быть от 0 до 5');
        return;
    }

    try {
        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            showModalMessage('Для оценки ответов необходимо авторизоваться');
            return;
        }

        const response = await fetch(`/answers/${answerId}/rate`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rating: rating })
        });

        if (response.ok) {
            showModalMessage('Рейтинг успешно обновлён');
            showAnswerModal(currentQuestionId); // Перезагружаем ответы
        } else if (response.status === 400) {
            showModalMessage('Некорректное значение рейтинга');
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка при обновлении рейтинга');
        }
    } catch (error) {
        console.error('Ошибка при обновлении рейтинга:', error);
        showModalMessage('Ошибка: ' + error.message);
    }
}

function getSelectedAnswerId() {
    const selectedAnswer = document.querySelector('.answer-card.selected');
    return selectedAnswer ? selectedAnswer.dataset.answerId : null;
}

async function deleteAdminAccount() {
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

function closeEditModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function showEditProfileForm() {
    try {
        const userData = await loadPersonData();
        if (!userData) {
            showModalMessage('Не удалось загрузить данные пользователя');
            return;
        }

        editProfileModal = document.getElementById('editProfileModal');

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

            // Обработчик отправки формы
            document.getElementById('profileEditForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                await saveProfileChanges();
            });
        }

        editProfileModal.style.display = 'flex';

    } catch (error) {
        console.error('Ошибка при открытии формы редактирования:', error);
        showModalMessage('Произошла ошибка при загрузке формы');
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
            updateAdminUserInfo().then(() => {
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

function logout() {
    localStorage.removeItem('jwtToken');
    currentUserIdQ = 0;
    updateAdminUserInfo();
    window.location.href = '/';
}

function initializeMessageModal() {
    if (modal) return;

    modal = document.createElement('div');
    modal.id = 'messageModal'; // Добавлен ID
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
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    }
}

function showBlockUser() {
    switchPanel('users');
    createUsersTable();
    loadAllUsers();
}

function showChangeRoleUser() {
    switchPanel('users');
    createRoleAssignmentTable();
    loadAllUsersForRoleAssignment();
}

function showAdminStats() {
    showModalMessage("Статистика системы будет доступна в следующей версии");
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

function checkAuthStatus() {
    const jwtToken = localStorage.getItem('jwtToken');
    if (!jwtToken) {
        disableAdminControls();
        showModalMessage('Для доступа к панели администратора необходимо авторизоваться');
    }
}

function disableAdminControls() {
    document.querySelector('.admin-dropdown button').disabled = true;
    document.querySelector('.admin-dropdown').style.opacity = '0.5';
    document.querySelector('.admin-dropdown').style.pointerEvents = 'none';

    document.getElementById('statsBtn').disabled = true;
    document.getElementById('statsBtn').style.opacity = '0.5';
    document.getElementById('statsBtn').style.pointerEvents = 'none';

    document.querySelector('.search-bar input').disabled = true;
    document.querySelector('.search-bar button').disabled = true;
    document.querySelector('.search-bar').style.opacity = '0.5';
    document.querySelector('.search-bar').style.pointerEvents = 'none';

    // Показываем только вход/регистрацию
    showAdminGuestMenu();
}

function enableAdminControls() {
    document.querySelector('.admin-dropdown button').disabled = false;
    document.querySelector('.admin-dropdown').style.opacity = '1';
    document.querySelector('.admin-dropdown').style.pointerEvents = 'auto';

    // Включаем кнопку статистики
    document.getElementById('statsBtn').disabled = false;
    document.getElementById('statsBtn').style.opacity = '1';
    document.getElementById('statsBtn').style.pointerEvents = 'auto';

    // Включаем поиск
    document.querySelector('.search-bar input').disabled = false;
    document.querySelector('.search-bar button').disabled = false;
    document.querySelector('.search-bar').style.opacity = '1';
    document.querySelector('.search-bar').style.pointerEvents = 'auto';
}

function setupAdminControls() {
    document.getElementById('questionsBtn').addEventListener('click', () => {
        switchPanel('questions');
    });

    document.getElementById('blockUserBtn').addEventListener('click', (e) => {
        e.preventDefault();
        if (!localStorage.getItem('jwtToken')) {
            showModalMessage('Для выполнения этого действия необходимо авторизоваться');
            return;
        }
        showBlockUser();
    });
    document.getElementById('assignRoleBtn').addEventListener('click', (e) => {
        e.preventDefault();
        if (!localStorage.getItem('jwtToken')) {
            showModalMessage('Для выполнения этого действия необходимо авторизоваться');
            return;
        }
        showChangeRoleUser();
    });

    // Статистика
    document.getElementById('statsBtn').addEventListener('click', (e) => {
        if (!localStorage.getItem('jwtToken')) {
            e.preventDefault();
            showModalMessage('Для просмотра статистики необходимо авторизоваться');
            return;
        }
        showAdminStats();
    });

    document.querySelector('.search-bar button').addEventListener('click', (e) => {
        if (!localStorage.getItem('jwtToken')) {
            e.preventDefault();
            showModalMessage('Для выполнения поиска необходимо авторизоваться');
            return;
        }
        handleSearch();
    });

    document.querySelector('.search-bar input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (!localStorage.getItem('jwtToken')) {
                e.preventDefault();
                showModalMessage('Для выполнения поиска необходимо авторизоваться');
                return;
            }
            handleSearch();
        }
    });
}

function showAdminGuestMenu() {
    const userDropdown = document.getElementById('userDropdown');
    userDropdown.innerHTML = `
        <a href="/signin"><i class="fas fa-sign-in-alt"></i> Войти</a>
        <a href="/signup"><i class="fas fa-user-plus"></i> Регистрация</a>
    `;
}

async function handleSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchTerm = searchInput.value.trim();

    if (!searchTerm) {
        if (currentPanel === 'questions') await fetchRandomQuestions();
        return;
    }

    // Если поиск выполняется не в панели вопросов - переключаемся
    if (currentPanel !== 'questions') {
        switchPanel('questions');
    }

    if (/^\d+$/.test(searchTerm)) {
        await fetchUserQuestions(parseInt(searchTerm));
    } else {
        showModalMessage("Пожалуйста, введите числовой ID пользователя");
    }
}

async function fetchUserQuestions(userId) {
    const container = document.getElementById('questions-list');
    document.querySelector('.questions-title').textContent = `Вопросы пользователя #${userId}`;
    container.innerHTML = '<div class="loading">Загрузка вопросов...</div>';

    try {
        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            showModalMessage('Для поиска вопросов необходимо авторизоваться');
            return;
        }

        const response = await fetch(`/questions/by-user/${userId}`, {
            headers: {
                'Accept': 'application/json; charset=utf-8',
                'Authorization': 'Bearer ' + jwtToken
            }
        });

        if (!response.ok) throw new Error('Ошибка сервера: ' + response.status);

        const questions = await response.json();
        container.innerHTML = '';

        if (!questions || questions.length === 0) {
            showModalMessage('Вопросы пользователя не найдены. Показаны случайные вопросы.');
            await fetchRandomQuestions(); // Загружаем случайные вопросы
            return;
        }

        questions.forEach(question => {
            const questionId = question.questionId || question.id;
            cachedQuestionsMap[questionId] = question;
            renderQuestionCard(container, question);
        });

    } catch (error) {
        console.error('Ошибка при загрузке вопросов:', error);
        showModalMessage('Ошибка при загрузке вопросов. Показаны случайные вопросы.');
        await fetchRandomQuestions();
    }
}

function setupSearchHandlers() {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}

function switchPanel(panelType) {
    const panel = document.getElementById('questions-panel');
    panel.innerHTML = '';
    currentPanel = panelType;
    if (panelType === 'questions') {
        const list = document.createElement('div');
        list.id = 'questions-list';
        list.className = 'questions-grid';
        panel.appendChild(list);
        fetchRandomQuestions();
    }
    else if (panelType === 'block') {
        createUsersTable();
        loadAllUsers();
    }
    else if (panelType === 'roles') {
        createRoleAssignmentTable();
        loadAllUsersForRoleAssignment();
    }
}

async function blockUser(personId) {
    if (!personId) {
        showModalMessage('Не удалось определить пользователя');
        return;
    }

    if (!confirm('Вы уверены, что хотите заблокировать этого пользователя?')) {
        return;
    }

    try {
        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            showModalMessage('Для этого действия необходимо авторизоваться');
            return;
        }

        // Удаляем пользователя по personId
        const response = await fetch(`/persons/${personId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showModalMessage('Пользователь успешно заблокирован (удален)');
            loadAllUsers(); // Обновляем таблицу
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Ошибка при блокировке пользователя');
        }
    } catch (error) {
        console.error('Ошибка при блокировке пользователя:', error);
        showModalMessage('Ошибка: ' + error.message);
    }
}

function renderUserRow(tableBody, person, userData) {
    const row = document.createElement('tr');
    row.className = 'user-row';

    // ID пользователя
    const idCell = document.createElement('td');
    idCell.textContent = person.personId;
    row.appendChild(idCell);

    // Имя
    const nameCell = document.createElement('td');
    nameCell.textContent = person.name || 'Не указано';
    row.appendChild(nameCell);

    // Фамилия
    const surnameCell = document.createElement('td');
    surnameCell.textContent = person.surname || 'Не указано';
    row.appendChild(surnameCell);

    // Email
    const emailCell = document.createElement('td');
    emailCell.textContent = person.email || 'Не указано';
    row.appendChild(emailCell);

    // Статус
    const statusCell = document.createElement('td');
    statusCell.textContent = userData?.status?.displayName || 'Студент';
    row.appendChild(statusCell);

    // Очки
    const pointsCell = document.createElement('td');
    pointsCell.textContent = userData?.points || 0;
    row.appendChild(pointsCell);

    // Кнопка блокировки
    const actionsCell = document.createElement('td');
    const blockBtn = document.createElement('button');
    blockBtn.className = 'user-action-btn block-btn';
    blockBtn.textContent = 'Заблокировать';
    blockBtn.addEventListener('click', () => blockUser(person.personId));

    actionsCell.appendChild(blockBtn);
    row.appendChild(actionsCell);

    tableBody.appendChild(row);
}

async function loadAllUsers() {
    const tableBody = document.getElementById('users-table-body');
    if (!tableBody) {
        console.error('Table body element not found');
        return;
    }

    tableBody.innerHTML = '<tr><td colspan="7" class="loading">Загрузка пользователей...</td></tr>';

    try {
        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            showModalMessage('Для управления пользователями необходимо авторизоваться');
            return;
        }

        // 1. Сначала получаем всех персон
        const personsResponse = await fetch('/persons/by-role/USER', {
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Accept': 'application/json; charset=utf-8'
            }
        });

        if (!personsResponse.ok) {
            throw new Error(`Ошибка сервера: ${personsResponse.status}`);
        }

        const persons = await personsResponse.json();
        if (!persons || persons.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="no-data">Пользователи не найдены</td></tr>';
            return;
        }

        // 2. Для каждой персоны получаем данные пользователя
        tableBody.innerHTML = '';

        for (const person of persons) {
            const userData = await getUserData(person.personId);
            renderUserRow(tableBody, person, userData);
        }

    } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
        tableBody.innerHTML = `<tr><td colspan="7" class="error">Ошибка: ${error.message}</td></tr>`;
    }
}

function createUsersTable() {
    const panel = document.getElementById('questions-panel');
    document.querySelector('.questions-title').textContent = `Удаление пользователей из системы`;
    panel.innerHTML = `
        <div class="table-container">
            <table class="users-table">
                <thead class="table-header">
                    <tr>
                        <th>ID</th><th>Имя</th><th>Фамилия</th><th>Email</th>
                        <th>Статус</th><th>Очки</th><th>Действия</th>
                    </tr>
                </thead>
                <tbody id="users-table-body"></tbody>
            </table>
        </div>
    `;
}

async function getUserData(personId) {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) return null;

        const response = await fetch(`/users/by-person/${personId}`, {
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        return null;
    }
}

async function assignAdminRole(personId) {
    if (!personId) {
        showModalMessage('Не удалось определить пользователя');
        return;
    }

    if (!confirm('Вы уверены, что хотите выдать этому пользователю роль администратора?')) {
        return;
    }

    try {
        const jwtToken = localStorage.getItem('jwtToken');

        const userResponse = await fetch(`/users/by-person/${personId}`, {
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Accept': 'application/json'
            }
        });

        if (!userResponse.ok) {
            throw new Error('Не удалось получить данные пользователя');
        }

        const user = await userResponse.json();

        // 2. Удаляем пользователя
        const deleteResponse = await fetch(`/users/${user.userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Content-Type': 'application/json'
            }
        });

        if (!deleteResponse.ok) {
            throw new Error('Ошибка при удалении пользователя');
        }

        const updateRoleResponse = await fetch(`/persons/${personId}/role`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: 'ADMIN' })
        });

        if (!updateRoleResponse.ok) {
            throw new Error('Ошибка при обновлении роли');
        }

        const createResponse = await fetch('/admins', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ person: { personId: personId } })
        });

        if (createResponse.ok) {
            showModalMessage('Роль администратора успешно выдана');
            loadAllUsersForRoleAssignment();
        } else {
            const error = await createResponse.json();
            throw new Error(error.message);
        }
    } catch (error) {
        console.error('Ошибка при выдаче роли администратора:', error);
        showModalMessage('Ошибка: ' + error.message);
    }
}

function renderUserRowForRoleAssignment(tableBody, person, userData) {
    const row = document.createElement('tr');
    row.className = 'user-row';

    // ID пользователя
    const idCell = document.createElement('td');
    idCell.textContent = person.personId;
    row.appendChild(idCell);

    // Имя
    const nameCell = document.createElement('td');
    nameCell.textContent = person.name || 'Не указано';
    row.appendChild(nameCell);

    // Фамилия
    const surnameCell = document.createElement('td');
    surnameCell.textContent = person.surname || 'Не указано';
    row.appendChild(surnameCell);

    // Email
    const emailCell = document.createElement('td');
    emailCell.textContent = person.email || 'Не указано';
    row.appendChild(emailCell);

    // Статус
    const statusCell = document.createElement('td');
    statusCell.textContent = userData?.status?.displayName || 'Студент';
    row.appendChild(statusCell);

    // Очки
    const pointsCell = document.createElement('td');
    pointsCell.textContent = userData?.points || 0;
    row.appendChild(pointsCell);

    // Кнопка выдачи роли
    const actionsCell = document.createElement('td');
    const assignBtn = document.createElement('button');
    assignBtn.className = 'user-action-btn assign-btn';
    assignBtn.textContent = 'Выдать роль';
    assignBtn.addEventListener('click', () => assignAdminRole(person.personId));

    actionsCell.appendChild(assignBtn);
    row.appendChild(actionsCell);

    tableBody.appendChild(row);
}

async function loadAllUsersForRoleAssignment() {
    const tableBody = document.getElementById('assign-role-table-body');
    if (!tableBody) {
        console.error('Table body element not found');
        return;
    }

    tableBody.innerHTML = '<tr><td colspan="7" class="loading">Загрузка пользователей...</td></tr>';

    try {
        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
            showModalMessage('Для управления ролями необходимо авторизоваться');
            return;
        }

        // 1. Сначала получаем всех персон
        const personsResponse = await fetch('/persons/by-role/USER', {
            headers: {
                'Authorization': 'Bearer ' + jwtToken,
                'Accept': 'application/json; charset=utf-8'
            }
        });

        if (!personsResponse.ok) {
            throw new Error(`Ошибка сервера: ${personsResponse.status}`);
        }

        const persons = await personsResponse.json();
        if (!persons || persons.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="no-data">Пользователи не найдены</td></tr>';
            return;
        }

        // 2. Для каждой персоны получаем данные пользователя
        tableBody.innerHTML = '';

        for (const person of persons) {
            const userData = await getUserData(person.personId);
            renderUserRowForRoleAssignment(tableBody, person, userData);
        }

    } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
        tableBody.innerHTML = `<tr><td colspan="7" class="error">Ошибка: ${error.message}</td></tr>`;
    }
}

function createRoleAssignmentTable() {
    const panel = document.getElementById('questions-panel');
    document.querySelector('.questions-title').textContent = `Изменений роли пользователя`;
    panel.innerHTML = `
        <div class="table-container">
            <table class="role-assignment-table">
                <thead class="table-header">
                    <tr>
                        <th>ID</th><th>Имя</th><th>Фамилия</th><th>Email</th>
                        <th>Статус</th><th>Очки</th><th>Действия</th>
                    </tr>
                </thead>
                <tbody id="assign-role-table-body"></tbody>
            </table>
        </div>
    `;
}

window.showEditProfileForm = showEditProfileForm;
window.logout = logout;
window.confirmAdminAccountDeletion = confirmAdminAccountDeletion;
window.closeEditModal = closeEditModal;
window.closeMessageModal = closeMessageModal;