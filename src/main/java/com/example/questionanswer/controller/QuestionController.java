package com.example.questionanswer.controller;

import com.example.questionanswer.dto.QuestionDto;
import com.example.questionanswer.dto.QuestionRequest;
import com.example.questionanswer.enums.Theme;
import com.example.questionanswer.model.Question;
import com.example.questionanswer.model.User;
import com.example.questionanswer.service.QuestionService;
import com.example.questionanswer.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;
    @Autowired
    private UserService userService;

    @GetMapping
    public List<Question> getAllQuestions() {
        return questionService.findAllQuestions();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Integer id) {
        Optional<Question> question = questionService.getQuestionById(id);
        return question.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/by-user/{userId}")
    public List<Question> getQuestionsByUserId(@PathVariable Integer userId) {
        return questionService.getQuestionsByUserId(userId);
    }

    @GetMapping("/by-theme/{theme}")
    public List<Question> getQuestionsByTheme(@PathVariable Theme theme) {
        return questionService.getQuestionsByTheme(theme);
    }

    @GetMapping("/search")
    public List<Question> searchQuestions(@RequestParam String query) {
        return questionService.searchQuestionsByText(query);
    }

    @PostMapping
    public ResponseEntity<QuestionDto> createQuestion(@RequestBody QuestionRequest questionRequest) {
        try {
            if (questionRequest.getText() == null || questionRequest.getText().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (questionRequest.getTheme() == null) {
                return ResponseEntity.badRequest().build();
            }

            User user = userService.getUserById(questionRequest.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Question question = new Question();
            question.setText(questionRequest.getText());
            question.setTheme(questionRequest.getTheme());
            question.setUser(user);
            question.setDate(new Date());

            Question createdQuestion = questionService.addQuestion(question);

            return ResponseEntity.ok(convertToDto(createdQuestion));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private QuestionDto convertToDto(Question question) {
        QuestionDto dto = new QuestionDto();
        dto.setQuestionId(question.getQuestionId());
        dto.setText(question.getText());
        dto.setTheme(question.getTheme());
        dto.setDate(question.getDate());
        dto.setUserId(question.getUser().getUserId());
        return dto;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Integer id) {
        Optional<Question> question = questionService.getQuestionById(id);
        if (question.isPresent()) {
            questionService.deleteQuestion(question.get());
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/random")
    public List<Question> getRandomQuestions(
            @RequestParam(defaultValue = "8") int count) {
        return questionService.getRandomQuestions(count);
    }
}