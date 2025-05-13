package com.example.questionanswer.model;

import com.example.questionanswer.enums.Status;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @OneToOne
    @JoinColumn(name = "person_id", referencedColumnName = "person_id", nullable = false)
    private Person person;

    @Column(name = "points", nullable = false)
    private Integer points = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.STUDENT;

    public String getFullName() {
        return person.getName() + " " + person.getSurname();
    }
}