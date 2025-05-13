package com.example.questionanswer.authentication;
import lombok.Data;

@Data
public class SignInRequest {
    private String login;
    private String password;

    public String getLogin() {
        return login;
    }

    public String getPassword() {
        return password;
    }
}
