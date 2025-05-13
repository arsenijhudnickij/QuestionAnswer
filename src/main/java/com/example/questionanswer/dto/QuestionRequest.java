package com.example.questionanswer.dto;

import com.example.questionanswer.enums.Theme;

public class QuestionRequest {
    private String text;
    private Theme theme;
    private Integer userId;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public Theme getTheme() { return theme; }
    public void setTheme(Theme theme) { this.theme = theme; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
}
