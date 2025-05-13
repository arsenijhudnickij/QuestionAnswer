package com.example.questionanswer.model;

import com.example.questionanswer.enums.Theme;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
@Entity
@Table(name = "question")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Integer questionId;

    @Column(name = "date", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date date;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "theme", nullable = false)
    private Theme theme;

    @NotBlank(message = "Текст вопроса не может быть пустым")
    @Size(max = 1000, message = "Текст вопроса не может превышать 1000 символов")
    @Column(name = "text", nullable = false, columnDefinition = "VARCHAR(1000)")
    private String text;
}