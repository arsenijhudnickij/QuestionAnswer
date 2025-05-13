package com.example.questionanswer.service;

import com.example.questionanswer.enums.Theme;
import com.example.questionanswer.model.Question;
import com.example.questionanswer.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {
    private QuestionRepository questionRepository;

    @Autowired
    public void setQuestionRepository(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public Question addQuestion(Question question) {
        if (question.getText() == null || question.getText().trim().isEmpty()) {
            throw new IllegalArgumentException("Текст вопроса не может быть пустым");
        }

        if (question.getText().length() > 1000) {
            throw new IllegalArgumentException("Текст вопроса превышает 1000 символов");
        }

        if (question.getTheme() == null) {
            throw new IllegalArgumentException("Тема вопроса не может быть null");
        }

        if (question.getUser() == null || question.getUser().getUserId() == null) {
            throw new IllegalArgumentException("Вопрос должен быть привязан к пользователю");
        }

        question.setDate(new Date());
        return questionRepository.save(question);
    }

    public Optional<Question> getQuestionById(Integer questionId) {
        if (questionId == null || questionId <= 0) {
            throw new IllegalArgumentException("Некорректный ID вопроса");
        }
        return questionRepository.findById(questionId);
    }

    public List<Question> getQuestionsByUserId(Integer userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Некорректный ID пользователя");
        }
        return questionRepository.findByUser_UserId(userId);
    }

    public List<Question> getQuestionsByTheme(Theme theme) {
        if (theme == null) {
            throw new IllegalArgumentException("Тема не может быть null");
        }
        return questionRepository.findByTheme(theme);
    }

    public void deleteQuestion(Question question) {
        if (question == null) {
            throw new IllegalArgumentException("Вопрос не может быть null");
        }
        questionRepository.delete(question);
    }

    public List<Question> findAllQuestions() {
        return questionRepository.findAll();
    }

    public List<Question> getRandomQuestions(int count) {
        if (count <= 0) {
            throw new IllegalArgumentException("Количество вопросов должно быть положительным");
        }
        return questionRepository.findRandomQuestions(count);
    }

    public List<Question> searchQuestionsByText(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new IllegalArgumentException("Поисковый запрос не может быть пустым");
        }
        return questionRepository.findByTextContaining(keyword);
    }
}