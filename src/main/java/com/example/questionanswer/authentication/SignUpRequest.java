package com.example.questionanswer.authentication;

import lombok.Data;
import java.util.Date;

@Data
public class SignUpRequest {
    private String name;
    private String surname;
    private String login;
    private String password;
    private String email;
    private Date birthdate;
}