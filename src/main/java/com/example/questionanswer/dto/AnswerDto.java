package com.example.questionanswer.dto;

import java.util.Date;

public class AnswerDto {
    private Integer answerId;
    private Date date;
    private Double rating;
    private String text;
    private String authorName;
    private String authorStatus;
    private Integer questionId; // Добавленное поле

    // Конструктор, геттеры и сеттеры
    public AnswerDto(Integer answerId, Date date, Double rating, String text,
                     String authorName, String authorStatus, Integer questionId) {
        this.answerId = answerId;
        this.date = date;
        this.rating = rating;
        this.text = text;
        this.authorName = authorName;
        this.authorStatus = authorStatus;
        this.questionId = questionId;
    }

    // Добавьте геттер и сеттер для questionId
    public Integer getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Integer questionId) {
        this.questionId = questionId;
    }

    // Геттеры и сеттеры
    public Integer getAnswerId() { return answerId; }
    public void setAnswerId(Integer answerId) { this.answerId = answerId; }

    public Date getDate() { return date; }
    public void setDate(Date date) { this.date = date; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorStatus() { return authorStatus; }
    public void setAuthorStatus(String authorStatus) { this.authorStatus = authorStatus; }
}