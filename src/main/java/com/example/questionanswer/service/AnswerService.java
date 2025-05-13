package com.example.questionanswer.service;

import com.example.questionanswer.model.Answer;
import com.example.questionanswer.repository.AnswerRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class AnswerService {
    private final AnswerRepository answerRepository;

    @Autowired
    public AnswerService(AnswerRepository answerRepository) {
        this.answerRepository = answerRepository;
    }

    @Transactional
    public Answer addAnswer(Answer answer) {
        answer.setDate(new Date());
        if (answer.getRating() == null) {
            answer.setRating(0.0);
        }
        return answerRepository.save(answer);
    }

    public Optional<Answer> getAnswerById(Integer answerId) {
        return answerRepository.findById(answerId);
    }

    public List<Answer> getAnswersByQuestionId(Integer questionId) {
        return answerRepository.findByQuestion_QuestionId(questionId);
    }

    public List<Answer> getAnswersByUserId(Integer userId) {
        return answerRepository.findByUser_UserId(userId);
    }

    @Transactional
    public void deleteAnswer(Integer answerId) {
        if (!answerRepository.existsById(answerId)) {
            throw new EntityNotFoundException("Answer with id " + answerId + " not found");
        }
        answerRepository.deleteById(answerId);
    }

    public List<Answer> findAllAnswers() {
        return answerRepository.findAll();
    }

    @Transactional
    public Answer updateAnswerRating(Integer answerId, Double rating) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new EntityNotFoundException("Answer not found"));

        if (rating < 0 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }

        answer.setRating(rating);
        return answerRepository.save(answer);
    }

    @Transactional
    public Answer updateAnswerText(Integer answerId, String text) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new EntityNotFoundException("Answer not found"));
        answer.setText(text);
        return answerRepository.save(answer);
    }
}