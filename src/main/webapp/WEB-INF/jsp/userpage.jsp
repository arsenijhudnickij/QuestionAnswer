<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EduSearch - Страница пользователя</title>
    <link rel="stylesheet" href="/css/edusearch.css">
    <link rel="stylesheet" href="/css/auth-forms.css">
    <link rel="stylesheet" href="/css/userpage.css">
    <link rel="stylesheet" href="/css/navbar-main.css">
    <link rel="stylesheet" href="/css/editProfile.css">
    <link rel="stylesheet" href="/css/questionModal.css">
    <link rel="icon" href="/logo.png" type="image/x-icon">
    <script src="/js/userpage.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
<header>
    <div class="navbar">
        <div class="logo">
            <img src="../logo.png" alt="EduSearch Logo" class="logo-img">
            EduSearch
        </div>
        <nav class="nav-center">
            <a href="/userpage" class="home-btn" id="randomQuestionsBtn">Вернуться на главную</a>
            <div class="theme-dropdown">
                <a href="#" class="dropdown-toggle">Поиск по теме <i class="fas fa-caret-down"></i></a>
                <div class="theme-dropdown-content">
                    <a href="/questions/theme/MATHS">Математика</a>
                    <a href="/questions/theme/PHYSICS">Физика</a>
                    <a href="/questions/theme/CHEMISTRY">Химия</a>
                    <a href="/questions/theme/LANGUAGES">Языки</a>
                    <a href="/questions/theme/HISTORY">История</a>
                    <a href="/questions/theme/LITERATURE">Литература</a>
                    <a href="/questions/theme/LIFE">Жизнь</a>
                </div>
            </div>
            <button class="ask-question-btn" id="askQuestionBtn">Задать вопрос</button>
        </nav>

        <div class="search-bar">
            <input type="text" placeholder="Поиск...">
            <button><i class="fas fa-search"></i></button>
        </div>

        <div class="profile-menu">
            <a href="#" class="dropdown-toggle">
                <i class="fas fa-user-circle"></i>
                <span id="userDisplayName">Личный кабинет</span>
            </a>
            <div class="dropdown-content" id="userDropdown">

            </div>
        </div>
    </div>
</header>

<main class="main-content">
    <div class="questions-section">
        <h2 class="questions-title">Пример вопросов</h2>
        <div id="random-questions-list" class="questions-grid">

        </div>
    </div>
</main>

<footer class="footer">
    <p>EduSearch &copy; 2025</p>
</footer>
</body>
</html>