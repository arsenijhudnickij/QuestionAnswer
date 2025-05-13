package com.example.questionanswer.repository;

import com.example.questionanswer.model.Person;
import com.example.questionanswer.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonRepository extends JpaRepository<Person, Integer> {
    Optional<Person> findByLogin(String login);
    Optional<Person> findByEmail(String email);
    boolean existsByLogin(String login);
    boolean existsByEmail(String email);
    List<Person> findByRole(Role role);
    List<Person> findByNameContainingIgnoreCase(String namePart);
    List<Person> findBySurnameContainingIgnoreCase(String surnamePart);
}