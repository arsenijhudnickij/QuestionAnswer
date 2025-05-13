package com.example.questionanswer.controller;

import com.example.questionanswer.dto.AnswerDto;
import com.example.questionanswer.dto.AnswerRequest;
import com.example.questionanswer.model.Answer;
import com.example.questionanswer.model.Question;
import com.example.questionanswer.model.User;
import com.example.questionanswer.service.AnswerService;
import com.example.questionanswer.service.QuestionService;
import com.example.questionanswer.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/answers")
public class AnswerController {

    private final AnswerService answerService;
    private final QuestionService questionService;
    private final UserService userService;

    @Autowired
    public AnswerController(AnswerService answerService, QuestionService questionService, UserService userService) {
        this.questionService = questionService;
        this.answerService = answerService;
        this.userService = userService;
    }

    @GetMapping
    public List<AnswerDto> getAllAnswers() {
        return convertToDtoList(answerService.findAllAnswers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnswerDto> getAnswerById(@PathVariable Integer id) {
        return answerService.getAnswerById(id)
                .map(answer -> ResponseEntity.ok(convertToDto(answer)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/question/{questionId}")
    public List<AnswerDto> getAnswersByQuestionId(@PathVariable Integer questionId) {
        return convertToDtoList(answerService.getAnswersByQuestionId(questionId));
    }

    @GetMapping("/user/{userId}")
    public List<AnswerDto> getAnswersByUserId(@PathVariable Integer userId) {
        return convertToDtoList(answerService.getAnswersByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<AnswerDto> createAnswer(@RequestBody AnswerRequest answerRequest) {
        try {
            if (answerRequest.getText() == null || answerRequest.getText().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Question question = questionService.getQuestionById(answerRequest.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Question not found"));
            User user = userService.getUserById(answerRequest.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Answer answer = new Answer();
            answer.setText(answerRequest.getText());
            answer.setQuestion(question);
            answer.setUser(user);
            answer.setDate(new Date());
            answer.setRating(0.0);

            Answer createdAnswer = answerService.addAnswer(answer);
            return ResponseEntity.ok(convertToDto(createdAnswer));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/rate")
    public ResponseEntity<AnswerDto> rateAnswer(
            @PathVariable Integer id,
            @RequestBody Map<String, Double> ratingRequest) {
        try {
            Double rating = ratingRequest.get("rating");
            if (rating == null || rating < 0 || rating > 5) {
                return ResponseEntity.badRequest().build();
            }

            Answer answer = answerService.updateAnswerRating(id, rating);
            return ResponseEntity.ok(convertToDto(answer));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/text")
    public ResponseEntity<AnswerDto> updateAnswerText(
            @PathVariable Integer id,
            @RequestParam String text) {
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Answer updatedAnswer = answerService.updateAnswerText(id, text);
            return ResponseEntity.ok(convertToDto(updatedAnswer));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Integer id) {
        try {
            answerService.deleteAnswer(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting answer", e);
        }
    }

    private AnswerDto convertToDto(Answer answer) {
        String statusDisplayName = "Пользователь";
        if (answer.getUser() != null && answer.getUser().getStatus() != null) {
            statusDisplayName = answer.getUser().getStatus().getDisplayName();
        }

        return new AnswerDto(
                answer.getAnswerId(),
                answer.getDate(),
                answer.getRating(),
                answer.getText(),
                answer.getUser() != null ? answer.getUser().getFullName() : "Аноним",
                statusDisplayName,
                answer.getQuestion() != null ? answer.getQuestion().getQuestionId() : null
        );
    }

    private List<AnswerDto> convertToDtoList(List<Answer> answers) {
        return answers.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
}