<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Регистрация - EduSearch</title>
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
    <div class="registration-container">
        <h2 class="registration-title">Регистрация в EduSearch</h2>
        <form id="signupForm" novalidate>
            <div class="form-group">
                <label for="name">Имя:</label>
                <input type="text" id="name" name="name" required maxlength="30" placeholder="Введите ваше имя">
                <p class="field-error" id="nameError"></p>
            </div>

            <div class="form-group">
                <label for="surname">Фамилия:</label>
                <input type="text" id="surname" name="surname" required maxlength="30" placeholder="Введите вашу фамилию">
                <p class="field-error" id="surnameError"></p>
            </div>

            <div class="form-group">
                <label for="login">Логин:</label>
                <input type="text" id="login" name="login" required maxlength="20" placeholder="Придумайте логин">
                <p class="field-error" id="loginError"></p>
            </div>

            <div class="form-group">
                <label for="email">Электронная почта:</label>
                <input type="email" id="email" name="email" required maxlength="50" placeholder="example@example.com">
                <p class="field-error" id="emailError"></p>
            </div>

            <div class="form-group">
                <label for="birthdate">Дата рождения:</label>
                <input type="date" id="birthdate" name="birthdate" required>
                <p class="field-error" id="birthdateError"></p>
            </div>

            <div class="form-group">
                <label for="password">Пароль:</label>
                <input type="password" id="password" name="password" required placeholder="Не менее 8 символов">
                <p class="field-error" id="passwordError"></p>
            </div>

            <div class="form-group">
                <label for="passwordRepeat">Повторите пароль:</label>
                <input type="password" id="passwordRepeat" required placeholder="Повторите ваш пароль">
                <p class="field-error" id="passwordRepeatError"></p>
            </div>

            <button type="submit">Зарегистрироваться</button>
        </form>

        <div class="auth-link">
            Уже зарегистрированы? <a href="/signin"><strong>Войдите в аккаунт</strong></a>
        </div>
    </div>
</main>

<!-- Универсальное модальное окно -->
<div id="messageModal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <p id="modalMessage"></p>
        <div style="text-align: right; margin-top: 10px;">
            <button id="modalOkBtn">OK</button>
        </div>
    </div>
</div>

<script>
    const modal = document.getElementById("messageModal");
    const modalMessage = document.getElementById("modalMessage");
    const closeBtn = document.getElementsByClassName("close")[0];
    const okBtn = document.getElementById("modalOkBtn");

    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };
    okBtn.onclick = () => {
        modal.style.display = "none";
        if (modalMessage.textContent.includes("успешно")) {
            window.location.href = '/signin?registration=success';
        }
    };

    function showModalMessage(message) {
        modalMessage.textContent = message;
        modal.style.display = "block";
    }

    function setFieldError(fieldId, message) {
        document.getElementById(fieldId).classList.add('error-field');
        document.getElementById(fieldId + 'Error').textContent = message;
    }

    function clearErrors() {
        const fields = ['name', 'surname', 'login', 'email', 'birthdate', 'password', 'passwordRepeat'];
        fields.forEach(field => {
            document.getElementById(field).classList.remove('error-field');
            document.getElementById(field + 'Error').textContent = '';
        });
    }

    document.getElementById('signupForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        clearErrors();

        let hasError = false;

        const name = document.getElementById('name').value.trim();
        const surname = document.getElementById('surname').value.trim();
        const login = document.getElementById('login').value.trim();
        const email = document.getElementById('email').value.trim();
        const birthdateValue = document.getElementById('birthdate').value;
        const password = document.getElementById('password').value;
        const passwordRepeat = document.getElementById('passwordRepeat').value;

        const namePattern = /^[a-zA-Zа-яА-ЯёЁ]+$/;
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

        if (!namePattern.test(name)) {
            setFieldError('name', 'Имя может содержать только буквы.');
            hasError = true;
        }

        if (!namePattern.test(surname)) {
            setFieldError('surname', 'Фамилия может содержать только буквы.');
            hasError = true;
        }

        if (!emailPattern.test(email)) {
            setFieldError('email', 'Неверный формат электронной почты.');
            hasError = true;
        }

        if (!birthdateValue) {
            setFieldError('birthdate', 'Укажите дату рождения.');
            hasError = true;
        } else {
            const birthdate = new Date(birthdateValue);
            const currentDate = new Date();
            let age = currentDate.getFullYear() - birthdate.getFullYear();
            const m = currentDate.getMonth() - birthdate.getMonth();
            if (m < 0 || (m === 0 && currentDate.getDate() < birthdate.getDate())) {
                age--;
            }
            if (age < 12) {
                setFieldError('birthdate', 'Вам должно быть не менее 12 лет.');
                hasError = true;
            }
        }

        if (password.length < 8 || password.length > 16) {
            setFieldError('password', 'Пароль должен быть от 8 до 16 символов.');
            hasError = true;
        }

        if (password !== passwordRepeat) {
            setFieldError('passwordRepeat', 'Пароли не совпадают.');
            hasError = true;
        }

        if (hasError) return;

        const formData = {
            name: name,
            surname: surname,
            login: login,
            email: email,
            birthdate: birthdateValue,
            password: password
        };

        try {
            const response = await fetch('/auth/signup', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                document.getElementById('signupForm').reset();
                showModalMessage('Регистрация прошла успешно!');
            } else {
                if (data.loginError) setFieldError('login', data.loginError);
                if (data.emailError) setFieldError('email', data.emailError);
                if (data.serverError) showModalMessage(data.serverError);
            }

        } catch (error) {
            showModalMessage("Ошибка соединения с сервером. Пожалуйста, попробуйте позже.");
            console.error('Registration error:', error);
        }
    });
</script>

<footer class="footer">
    <p>EduSearch &copy; 2025</p>
</footer>

</body>
</html>
