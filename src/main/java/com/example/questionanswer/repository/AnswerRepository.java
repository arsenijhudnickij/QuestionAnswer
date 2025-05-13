package com.example.questionanswer.repository;

import com.example.questionanswer.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Integer> {
    List<Answer> findByQuestion_QuestionId(Integer questionId);
    List<Answer> findByUser_UserId(Integer userId);
    List<Answer> findByRatingGreaterThanEqual(Double minRating);
    List<Answer> findByRatingLessThanEqual(Double maxRating);
    List<Answer> findByDateBetween(Date startDate, Date endDate);
    List<Answer> findByQuestion_QuestionIdAndUser_UserId(Integer questionId, Integer userId);
    List<Answer> findByOrderByRatingDesc();
    List<Answer> findByOrderByDateDesc();
}