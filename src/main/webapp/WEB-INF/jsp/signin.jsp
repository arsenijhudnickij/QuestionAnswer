<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Авторизация - EduSearch</title>

    <link rel="stylesheet" href="/css/edusearch.css">
    <link rel="stylesheet" href="/css/auth-forms.css">
    <link rel="stylesheet" href="/css/navbar.css">

    <link rel="icon" href="../logo.png" type="image/x-icon">
</head>
<body>
<header>
    <header>
        <div class="navbar">
            <div class="logo">
                <img src="../logo.png" alt="EduSearch Logo" class="logo-img">
                EduSearch
            </div>

            <nav class="nav-center">
                <a href="/">Главная</a>
                <a href="/aboutus">О нас</a>
                <a href="/info">Контакты</a>
            </nav>
        </div>
    </header>

</header>
<main class="main-content">
    <div class="login-container">
        <h2 class="login-title">Вход в систему</h2>
        <form id="loginForm">
            <div class="form-group">
                <label for="login">Логин:</label>
                <input type="text" id="login" name="login" required placeholder="Введите ваш логин">
            </div>

            <div class="form-group">
                <label for="password">Пароль:</label>
                <input type="password" id="password" name="password" required placeholder="Введите ваш пароль">
            </div>

            <button type="submit">Войти</button>
        </form>

        <div class="auth-link">
            Нет аккаунта? <a href="/signup"><strong>Зарегистрируйтесь</strong></a>
        </div>

        <p id="error" class="error-message"></p>
    </div>
</main>

<!-- Модальное окно -->
<div id="messageModal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <p id="modalMessage"></p>
        <div style="text-align: right; margin-top: 10px;">
            <button id="modalOkBtn">OK</button>
        </div>
    </div>
</div>

<footer class="footer">
    <p>EduSearch &copy; 2025</p>
</footer>

<script>
    const modal = document.getElementById("messageModal");
    const modalMessage = document.getElementById("modalMessage");
    const closeBtn = document.getElementsByClassName("close")[0];
    const okBtn = document.getElementById("modalOkBtn");

    let redirectUrl = null;

    closeBtn.onclick = () => {
        modal.style.display = "none";
        if (redirectUrl) window.location.href = redirectUrl;
    };

    window.onclick = e => {
        if (e.target === modal) {
            modal.style.display = "none";
            if (redirectUrl) window.location.href = redirectUrl;
        }
    };

    okBtn.onclick = () => {
        modal.style.display = "none";
        if (redirectUrl) window.location.href = redirectUrl;
    };

    function showModalMessage(message, redirectAfter = null) {
        modalMessage.textContent = message;
        redirectUrl = redirectAfter;
        modal.style.display = "block";
    }

    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('error');

        errorElement.textContent = '';

        try {
            const response = await fetch('/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ login, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('jwtToken', data.token);

                if (data.role === 'ADMIN') {
                    showModalMessage('Авторизация успешна! Вы вошли под ролью Администратора', '/adminpage');
                } else {
                    showModalMessage('Авторизация успешна! Вы вошли под ролью Пользователя', '/userpage');
                }
            } else {
                const errorText = await response.text();
                let errorMessage = "Ошибка авторизации";

                if (response.status === 401) {
                    if (errorText.includes("Person not found")) {
                        errorMessage = "Пользователь с таким логином не найден";
                    } else if (errorText.includes("Invalid password")) {
                        errorMessage = "Неверный пароль";
                    } else {
                        errorMessage = "Неверные учетные данные";
                    }
                } else {
                    errorMessage = "Ошибка сервера. Пожалуйста, попробуйте позже.";
                }

                showModalMessage(errorMessage);
            }
        } catch (error) {
            errorElement.textContent = "Ошибка соединения с сервером";
            console.error('Login error:', error);
        }
    });
</script>
</body>
</html>
