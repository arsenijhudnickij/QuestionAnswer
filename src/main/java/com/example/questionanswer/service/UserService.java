package com.example.questionanswer.service;

import com.example.questionanswer.enums.Status;
import com.example.questionanswer.model.User;
import com.example.questionanswer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final AnswerService answerService;

    @Autowired
    public UserService(UserRepository userRepository, AnswerService answerService) {
        this.userRepository = userRepository;
        this.answerService = answerService;
    }

    public User addUser(User user) {
        user.setStatus(Status.STUDENT);
        user.setPoints(0);
        return userRepository.save(user);
    }

    public Optional<User> getUserById(Integer userId) {
        return userRepository.findById(userId);
    }

    public Optional<User> getUserByPersonId(Integer personId) {
        return userRepository.findByPerson_PersonId(personId);
    }

    public void deleteUser(User user) {
        userRepository.delete(user);
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public User updateUserPoints(Integer userId, Integer points) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPoints(points);
        user.setStatus(calculateStatus(points));
        return userRepository.save(user);
    }

    @Transactional
    public User updateUserPointsFromAnswers(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        double totalPoints = answerService.getAnswersByUserId(userId).stream()
                .mapToDouble(answer -> answer.getRating() != null ? answer.getRating() : 0.0)
                .sum();

        int roundedPoints = (int) Math.round(totalPoints);
        user.setPoints(roundedPoints);
        user.setStatus(calculateStatus(roundedPoints));

        return userRepository.save(user);
    }

    public List<User> getUsersByStatus(Status status) {
        return userRepository.findByStatus(status);
    }

    public Status calculateStatus(int points) {
        if (points >= 10000) return Status.GENIUS;
        if (points >= 5000) return Status.MASTER;
        if (points >= 2500) return Status.SCIENTIST;
        if (points >= 1000) return Status.EXPERT;
        if (points >= 500) return Status.CONNOISSEUR;
        if (points >= 100) return Status.UNDERGRAND;
        return Status.STUDENT;
    }

    public int calculatePointsToNextStatus(int points) {
        if (points < 100) return 100 - points;
        if (points < 500) return 500 - points;
        if (points < 1000) return 1000 - points;
        if (points < 2500) return 2500 - points;
        if (points < 5000) return 5000 - points;
        if (points < 10000) return 10000 - points;
        return 0;
    }

    public List<User> getUsersWithMinPoints(Integer minPoints) {
        return userRepository.findByPointsGreaterThanEqual(minPoints);
    }

    public List<User> getUsersWithMaxPoints(Integer maxPoints) {
        return userRepository.findByPointsLessThanEqual(maxPoints);
    }

    public List<User> getUsersWithPointsBetween(Integer min, Integer max) {
        return userRepository.findByPointsBetween(min, max);
    }
}