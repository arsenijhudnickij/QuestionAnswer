<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EduSearch - Админ панель</title>
    <link rel="stylesheet" href="/css/edusearch.css">
    <link rel="stylesheet" href="/css/navbar-main.css">
    <link rel="stylesheet" href="/css/admin.css">
    <link rel="icon" href="/logo.png" type="image/x-icon">
    <script src="/js/adminpage.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
<header>
    <div class="navbar">
        <div class="logo">
            <img src="../logo.png" alt="EduSearch Logo" class="logo-img">
            EduSearch | Админ
        </div>

        <nav class="nav-center">
            <button class="ask-question-btn" id="questionsBtn">
                <i class="fas fa-question-circle"></i> Вопросы
            </button>

            <div class="admin-dropdown">
                <button class="ask-question-btn">
                    <i class="fas fa-users-cog"></i> Управление пользователями
                    <i class="fas fa-caret-down"></i>
                </button>
                <div class="admin-dropdown-content">
                    <a id="blockUserBtn"><i class="fas fa-user-lock"></i> Блокировка</a>
                    <a id="assignRoleBtn"><i class="fas fa-user-tag"></i> Выдача роли</a>
                </div>
            </div>

            <button class="ask-question-btn" id="statsBtn">
                <i class="fas fa-chart-bar"></i> Статистика
            </button>

            <div class="search-bar">
                <input type="text" placeholder="Поиск вопросов пользователя...">
                <button><i class="fas fa-search"></i></button>
            </div>
        </nav>

        <div class="profile-menu">
            <a href="#" class="dropdown-toggle">
                <i class="fas fa-user-shield"></i>
                <span id="userDisplayName">Админ</span>
            </a>
            <div class="dropdown-content" id="userDropdown">
                <a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Выйти</a>
            </div>
        </div>
    </div>
</header>

<main class="main-content">
    <div class="questions-section">
        <h2 class="questions-title">Панель администратора</h2>

        <div id="questions-panel" class="admin-panel active">
            <div id="questions-list" class="questions-grid"></div>
        </div>
    </div>
</main>

<footer class="footer">
    <p>EduSearch &copy; 2025</p>
</footer>
</body>
</html>