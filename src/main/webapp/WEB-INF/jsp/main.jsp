<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EduSearch - Главная</title>
    <link rel="stylesheet" href="/css/edusearch.css">
    <link rel="stylesheet" href="/css/auth-forms.css">
    <link rel="stylesheet" href="/css/navbar-main.css">
    <link rel="stylesheet" href="/css/main.css">
    <script src="/js/main.js"></script>
    <link rel="icon" href="/logo.png" type="image/x-icon">
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
            <a href="/">Главная</a>
            <a href="/aboutus">О нас</a>
            <a href="/info">Контакты</a>
        </nav>

        <div class="search-bar">
            <input type="text" placeholder="Поиск...">
            <button><i class="fas fa-search"></i></button>
        </div>

        <div class="profile-menu">
            <a class="dropdown-toggle">
                <i class="fas fa-user-circle"></i>
                <span>Личный кабинет</span>
            </a>
            <div class="dropdown-content">
                <a href="/signin"><i class="fas fa-sign-in-alt"></i> Войти</a>
                <a href="/signup"><i class="fas fa-user-plus"></i> Регистрация</a>
            </div>
        </div>
    </div>
</header>


<main class="main-content">
    <div class="questions-section">
        <h2 class="questions-title">Пример наших вопросов</h2>
        <div id="random-questions-list" class="questions-grid">
            <!-- Вопросы будут загружены через JavaScript -->
        </div>
    </div>
</main>



<footer class="footer">
    <p>EduSearch &copy; 2025</p>
</footer>
</body>
</html>
