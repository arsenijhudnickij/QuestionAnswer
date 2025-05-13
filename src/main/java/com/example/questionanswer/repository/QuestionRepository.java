package com.example.questionanswer.repository;

import com.example.questionanswer.model.Question;
import com.example.questionanswer.enums.Theme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Integer> {
    List<Question> findByUser_UserId(Integer userId);
    List<Question> findByTheme(Theme theme);
    List<Question> findByDateBetween(Date startDate, Date endDate);
    List<Question> findByUser_UserIdAndTheme(Integer userId, Theme theme);
    List<Question> findByThemeIn(List<Theme> themes);
    List<Question> findByOrderByDateDesc();

    @Query("SELECT q FROM Question q WHERE LOWER(q.text) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Question> findByTextContaining(@Param("keyword") String keyword);

    @Query(value = "SELECT * FROM question ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomQuestions(@Param("limit") int limit);
}