package com.example.questionanswer.controller;

import com.example.questionanswer.enums.Status;
import com.example.questionanswer.model.Person;
import com.example.questionanswer.model.User;
import com.example.questionanswer.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserControllerTest {
    @Mock
    private UserService userService;
    @InjectMocks
    private UserController userController;
    @Test
    void getUserByPersonId_UserExists_ReturnsOk() {
        int personId = 1;
        User user = new User();
        user.setUserId(10);
        user.setPoints(100);
        user.setStatus(Status.SCIENTIST);
        when(userService.getUserByPersonId(personId)).thenReturn(Optional.of(user));
        ResponseEntity<User> response = userController.getUserByPersonId(personId);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(user, response.getBody());
    }
    @Test
    void getUserByPersonId_UserNotFound_ReturnsNotFound() {
        int personId = 2;
        when(userService.getUserByPersonId(personId)).thenReturn(Optional.empty());
        ResponseEntity<User> response = userController.getUserByPersonId(personId);
        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());
    }
}
