package com.example.questionanswer.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Date;

@Data
@Entity
@Table(name = "answer")
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id")
    private Integer answerId;

    @Column(name = "date", nullable = false)
    private Date date;

    @Column(name = "rating", nullable = false)
    private Double rating = 0.0;

    @NotBlank(message = "Текст ответа не может быть пустым")
    @Size(max = 2000, message = "Текст ответа не может превышать 2000 символов")
    @Column(name = "text", nullable = false, length = 2000)
    private String text;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}