package com.example.questionanswer.repository;

import com.example.questionanswer.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer> {
    Optional<Admin> findByPerson_PersonId(Integer personId);
    boolean existsByPerson_PersonId(Integer personId);
}