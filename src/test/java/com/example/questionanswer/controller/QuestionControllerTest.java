package com.example.questionanswer.controller;

import com.example.questionanswer.dto.QuestionDto;
import com.example.questionanswer.dto.QuestionRequest;
import com.example.questionanswer.enums.Theme;
import com.example.questionanswer.model.Person;
import com.example.questionanswer.model.Question;
import com.example.questionanswer.model.User;
import com.example.questionanswer.service.QuestionService;
import com.example.questionanswer.service.UserService;
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
class QuestionControllerTest {

    @Mock
    private QuestionService questionService;

    @Mock
    private UserService userService;

    @InjectMocks
    private QuestionController questionController;

    private Question createMockQuestion() {
        Person person = new Person();
        person.setPersonId(1);
        person.setName("John");
        person.setSurname("Doe");
        person.setLogin("john");
        person.setPassword("pass");
        person.setEmail("john@example.com");
        person.setBirthdate(new Date());

        User user = new User();
        user.setUserId(1);
        user.setPerson(person);

        Question question = new Question();
        question.setQuestionId(1);
        question.setText("Sample question?");
        question.setTheme(Theme.MATHS);
        question.setDate(new Date());
        question.setUser(user);

        return question;
    }

    @Test
    void getAllQuestions_ReturnsList() {
        Question question = createMockQuestion();
        when(questionService.findAllQuestions()).thenReturn(Collections.singletonList(question));

        List<Question> result = questionController.getAllQuestions();

        assertEquals(1, result.size());
        assertEquals("Sample question?", result.get(0).getText());
    }

    @Test
    void getQuestionById_Found() {
        Question question = createMockQuestion();
        when(questionService.getQuestionById(1)).thenReturn(Optional.of(question));

        ResponseEntity<Question> response = questionController.getQuestionById(1);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Sample question?", response.getBody().getText());
    }

    @Test
    void getQuestionById_NotFound() {
        when(questionService.getQuestionById(999)).thenReturn(Optional.empty());

        ResponseEntity<Question> response = questionController.getQuestionById(999);

        assertEquals(404, response.getStatusCodeValue());
    }

    @Test
    void getQuestionsByUserId_ReturnsList() {
        Question question = createMockQuestion();
        when(questionService.getQuestionsByUserId(1)).thenReturn(Collections.singletonList(question));

        List<Question> result = questionController.getQuestionsByUserId(1);

        assertEquals(1, result.size());
    }

    @Test
    void getQuestionsByTheme_ReturnsList() {
        Question question = createMockQuestion();
        when(questionService.getQuestionsByTheme(Theme.MATHS)).thenReturn(Collections.singletonList(question));

        List<Question> result = questionController.getQuestionsByTheme(Theme.MATHS);

        assertEquals(1, result.size());
        assertEquals(Theme.MATHS, result.get(0).getTheme());
    }

    @Test
    void searchQuestions_ReturnsMatchingQuestions() {
        Question question = createMockQuestion();
        when(questionService.searchQuestionsByText("Sample")).thenReturn(Collections.singletonList(question));

        List<Question> result = questionController.searchQuestions("Sample");

        assertEquals(1, result.size());
    }

    @Test
    void createQuestion_ValidRequest_ReturnsDto() {
        QuestionRequest request = new QuestionRequest();
        request.setText("New question?");
        request.setTheme(Theme.MATHS);
        request.setUserId(1);

        User user = createMockQuestion().getUser();
        Question savedQuestion = createMockQuestion();
        savedQuestion.setText("New question?");
        savedQuestion.setTheme(Theme.MATHS);

        when(userService.getUserById(1)).thenReturn(Optional.of(user));
        when(questionService.addQuestion(any(Question.class))).thenReturn(savedQuestion);

        ResponseEntity<QuestionDto> response = questionController.createQuestion(request);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("New question?", response.getBody().getText());
    }

    @Test
    void createQuestion_InvalidRequest_ReturnsBadRequest() {
        QuestionRequest emptyTextRequest = new QuestionRequest();
        emptyTextRequest.setText("");
        emptyTextRequest.setTheme(Theme.MATHS);
        emptyTextRequest.setUserId(1);

        ResponseEntity<QuestionDto> response = questionController.createQuestion(emptyTextRequest);
        assertEquals(400, response.getStatusCodeValue());
    }

    @Test
    void deleteQuestion_ExistingId_ReturnsNoContent() {
        Question question = createMockQuestion();
        when(questionService.getQuestionById(1)).thenReturn(Optional.of(question));

        ResponseEntity<Void> response = questionController.deleteQuestion(1);

        verify(questionService, times(1)).deleteQuestion(question);
        assertEquals(204, response.getStatusCodeValue());
    }

    @Test
    void deleteQuestion_NotFound_ReturnsNotFound() {
        when(questionService.getQuestionById(99)).thenReturn(Optional.empty());

        ResponseEntity<Void> response = questionController.deleteQuestion(99);

        assertEquals(404, response.getStatusCodeValue());
    }

    @Test
    void getRandomQuestions_ReturnsList() {
        Question question = createMockQuestion();
        when(questionService.getRandomQuestions(8)).thenReturn(Collections.singletonList(question));

        List<Question> result = questionController.getRandomQuestions(8);

        assertEquals(1, result.size());
    }
}
