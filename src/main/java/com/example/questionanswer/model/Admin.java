package com.example.questionanswer.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "admin")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "admin_id")
    private Integer adminId;

    @OneToOne
    @JoinColumn(name = "person_id", referencedColumnName = "person_id", nullable = false)
    private Person person;

    public String getFullName() {
        return person.getName() + " " + person.getSurname();
    }
}