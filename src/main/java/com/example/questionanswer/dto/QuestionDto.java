package com.example.questionanswer.dto;

import com.example.questionanswer.enums.Theme;

import java.util.Date;

public class QuestionDto {
    private Integer questionId;
    private String text;
    private Theme theme;
    private Date date;
    private Integer userId;

    public Integer getQuestionId() { return questionId; }
    public void setQuestionId(Integer questionId) { this.questionId = questionId; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public Theme getTheme() { return theme; }
    public void setTheme(Theme theme) { this.theme = theme; }
    public Date getDate() { return date; }
    public void setDate(Date date) { this.date = date; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
}
