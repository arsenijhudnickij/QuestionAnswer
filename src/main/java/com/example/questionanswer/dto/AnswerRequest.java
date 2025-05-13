package com.example.questionanswer.dto;

import lombok.Data;

@Data
public class AnswerRequest {
    private String text;
    private Integer questionId;
    private Integer userId;
}