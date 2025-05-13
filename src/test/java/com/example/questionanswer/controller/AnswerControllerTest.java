package com.example.questionanswer.controller;

import com.example.questionanswer.dto.AnswerDto;
import com.example.questionanswer.dto.AnswerRequest;
import com.example.questionanswer.enums.Status;
import com.example.questionanswer.model.Answer;
import com.example.questionanswer.model.Person;
import com.example.questionanswer.model.Question;
import com.example.questionanswer.model.User;
import com.example.questionanswer.service.AnswerService;
import com.example.questionanswer.service.QuestionService;
import com.example.questionanswer.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnswerControllerTest {

    @Mock
    private AnswerService answerService;

    @Mock
    private QuestionService questionService;

    @Mock
    private UserService userService;

    @InjectMocks
    private AnswerController answerController;

    private Answer answer;
    private User user;
    private Question question;

    @BeforeEach
    void setup() {
        Person person = new Person();
        person.setName("John");
        person.setSurname("Doe");

        user = new User();
        user.setUserId(1);
        user.setPerson(person);
        user.setStatus(Status.STUDENT);

        question = new Question();
        question.setQuestionId(1);

        answer = new Answer();
        answer.setAnswerId(1);
        answer.setText("Answer text");
        answer.setUser(user);
        answer.setQuestion(question);
        answer.setDate(new Date());
        answer.setRating(4.0);
    }

    @Test
    void getAllAnswers_ReturnsList() {
        when(answerService.findAllAnswers()).thenReturn(List.of(answer));

        List<AnswerDto> result = answerController.getAllAnswers();

        assertEquals(1, result.size());
        assertEquals("Answer text", result.get(0).getText());
    }

    @Test
    void getAnswerById_Found() {
        when(answerService.getAnswerById(1)).thenReturn(Optional.of(answer));

        ResponseEntity<AnswerDto> response = answerController.getAnswerById(1);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Answer text", response.getBody().getText());
    }

    @Test
    void getAnswerById_NotFound() {
        when(answerService.getAnswerById(999)).thenReturn(Optional.empty());

        ResponseEntity<AnswerDto> response = answerController.getAnswerById(999);

        assertEquals(404, response.getStatusCodeValue());
    }

    @Test
    void getAnswersByQuestionId_ReturnsList() {
        when(answerService.getAnswersByQuestionId(1)).thenReturn(List.of(answer));

        List<AnswerDto> result = answerController.getAnswersByQuestionId(1);

        assertEquals(1, result.size());
        assertEquals("Answer text", result.get(0).getText());
    }

    @Test
    void getAnswersByUserId_ReturnsList() {
        when(answerService.getAnswersByUserId(1)).thenReturn(List.of(answer));

        List<AnswerDto> result = answerController.getAnswersByUserId(1);

        assertEquals(1, result.size());
    }

    @Test
    void createAnswer_ValidRequest_ReturnsAnswerDto() {
        AnswerRequest request = new AnswerRequest();
        request.setText("New Answer");
        request.setUserId(1);
        request.setQuestionId(1);

        when(userService.getUserById(1)).thenReturn(Optional.of(user));
        when(questionService.getQuestionById(1)).thenReturn(Optional.of(question));

        Answer savedAnswer = new Answer();
        savedAnswer.setAnswerId(2);
        savedAnswer.setText("New Answer");
        savedAnswer.setUser(user);
        savedAnswer.setQuestion(question);
        savedAnswer.setRating(0.0);
        savedAnswer.setDate(new Date());

        when(answerService.addAnswer(any(Answer.class))).thenReturn(savedAnswer);

        ResponseEntity<AnswerDto> response = answerController.createAnswer(request);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("New Answer", response.getBody().getText());
    }

    @Test
    void createAnswer_EmptyText_ReturnsBadRequest() {
        AnswerRequest request = new AnswerRequest();
        request.setText("  ");
        request.setUserId(1);
        request.setQuestionId(1);

        ResponseEntity<AnswerDto> response = answerController.createAnswer(request);

        assertEquals(400, response.getStatusCodeValue());
    }

    @Test
    void rateAnswer_ValidRating_ReturnsUpdatedAnswer() {
        when(answerService.updateAnswerRating(1, 4.5)).thenReturn(answer);

        Map<String, Double> ratingMap = new HashMap<>();
        ratingMap.put("rating", 4.5);

        ResponseEntity<AnswerDto> response = answerController.rateAnswer(1, ratingMap);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(4.0, response.getBody().getRating()); // Assuming rating was not updated in mock
    }

    @Test
    void rateAnswer_InvalidRating_ReturnsBadRequest() {
        Map<String, Double> ratingMap = new HashMap<>();
        ratingMap.put("rating", 6.0);

        ResponseEntity<AnswerDto> response = answerController.rateAnswer(1, ratingMap);

        assertEquals(400, response.getStatusCodeValue());
    }

    @Test
    void updateAnswerText_Valid_ReturnsUpdatedAnswer() {
        when(answerService.updateAnswerText(1, "Updated")).thenReturn(answer);

        ResponseEntity<AnswerDto> response = answerController.updateAnswerText(1, "Updated");

        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void updateAnswerText_Empty_ReturnsBadRequest() {
        ResponseEntity<AnswerDto> response = answerController.updateAnswerText(1, " ");

        assertEquals(400, response.getStatusCodeValue());
    }

    @Test
    void deleteAnswer_ValidId_ReturnsNoContent() {
        doNothing().when(answerService).deleteAnswer(1);

        ResponseEntity<Void> response = answerController.deleteAnswer(1);

        assertEquals(204, response.getStatusCodeValue());
    }
}
