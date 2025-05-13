<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EduSearch - Контакты</title>
    <link rel="stylesheet" href="/css/edusearch.css">
    <link rel="stylesheet" href="/css/navbar-main.css">
    <link rel="stylesheet" href="/css/aboutus.css">
    <link rel="icon" href="/logo.png" type="image/x-icon">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        .contact-block {
            padding: 15px;
            border-radius: 14px;
            box-shadow: 0 2px 12px rgba(46, 125, 50, 0.08);
            display: flex;
            align-items: center;
            gap: 10px;
            transition: box-shadow 0.2s;
        }
        .contact-block:hover {
            box-shadow: 0 4px 20px rgba(46, 125, 50, 0.13);
        }
        .email {
            background-color: #e8f5e9; /* Light green */
        }
        .phone {
            background-color: #f5f5f5; /* Light gray */
        }
        .instagram {
            background-color: #ffebee; /* Light red */
        }
        .linkedin {
            background-color: #e3f2fd; /* Light blue */
        }
        .contact-header {
            margin: 20px 0;
            font-size: 1.5rem;
            font-weight: bold;
        }
    </style>
</head>
<body>
<header>
    <div class="navbar">
        <div class="logo">
            <img src="../logo.png" alt="EduSearch Logo" class="logo-img" style="height:32px; vertical-align:middle;">
            EduSearch
        </div>
        <nav class="nav-center">
            <a href="/">Главная</a>
            <a href="/aboutus">О нас</a>
            <a href="/info">Контакты</a>
        </nav>
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
    <div class="contact-page">
        <div class="developer-info">
            <h2>О разработчике</h2>
            <p>EduSearch был создан Худницким Арсением, студентом третьего курса Бгуир. Я
                стремлюсь улучшить образовательный процесс, предоставляя уникальные возможности для
                обучения. Моя цель — предоставить студентам и преподавателям удобные инструменты для
                обмена знаниями и ресурсами. Я верю, что образование должно быть доступным и интересным
                для всех, и поэтому мы постоянно обновляем наш контент. Мы нацелены на создание среды,
                где каждый сможет развиваться, находить поддержку и вдохновение. Наши материалы охватывают
                широкий спектр тем, что позволяет каждому пользователю находить нужную информацию и делиться
                своим опытом с другими. Присоединяйтесь к нам и вместе мы сделаем обучение более
                увлекательным и эффективным!</p>
        </div>
        <div class="contact-blocks">
            <div class="contact-block">
                <span>Возможности связи:</span>
            </div>
            <div class="contact-block email">
                <i class="fas fa-envelope"></i>
                <span><a href="mailto:arsenijhudnickij@gmail.com">arsenijhudnickij@gmail.com</a></span>
            </div>
            <div class="contact-block phone">
                <i class="fas fa-phone"></i>
                <span>+375-33-312-95-34</span>
            </div>
            <div class="contact-block instagram">
                <i class="fab fa-instagram"></i>
                <span><a href="https://instagram.com/hi_arseniy" target="_blank">@hi_arseniy</a></span>
            </div>
            <div class="contact-block linkedin">
                <i class="fab fa-linkedin"></i>
                <span><a href="https://www.linkedin.com/in/%D0%B0%D1%80%D1%81%D0%B5%D0%BD%D0%B8%D0%B9-%D1%85%D1%83%D0%B4%D0%BD%D0%B8%D1%86%D0%BA%D0%B8%D0%B9-095736293/" target="_blank">Arseniy Khudnitskiy</a></span>
            </div>
        </div>
    </div>
</main>

<footer class="footer">
    <p>EduSearch &copy; 2025</p>
</footer>
</body>
</html>