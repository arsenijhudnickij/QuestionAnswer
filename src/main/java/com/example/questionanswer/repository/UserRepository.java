package com.example.questionanswer.repository;

import com.example.questionanswer.model.User;
import com.example.questionanswer.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByPerson_PersonId(Integer personId);
    List<User> findByStatus(Status status);
    List<User> findByPointsGreaterThanEqual(Integer minPoints);
    List<User> findByPointsLessThanEqual(Integer maxPoints);
    List<User> findByPointsBetween(Integer minPoints, Integer maxPoints);
}