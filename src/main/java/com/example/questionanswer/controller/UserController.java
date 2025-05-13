package com.example.questionanswer.controller;

import com.example.questionanswer.dto.UserProfileDto;
import com.example.questionanswer.enums.Status;
import com.example.questionanswer.model.User;
import com.example.questionanswer.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.findAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/by-person/{personId}")
    public ResponseEntity<User> getUserByPersonId(@PathVariable Integer personId) {
        Optional<User> user = userService.getUserByPersonId(personId);
        return user.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/by-status/{status}")
    public List<User> getUsersByStatus(@PathVariable Status status) {
        return userService.getUsersByStatus(status);
    }

    @GetMapping("/with-min-points/{minPoints}")
    public List<User> getUsersWithMinPoints(@PathVariable Integer minPoints) {
        return userService.getUsersWithMinPoints(minPoints);
    }

    @GetMapping("/with-max-points/{maxPoints}")
    public List<User> getUsersWithMaxPoints(@PathVariable Integer maxPoints) {
        return userService.getUsersWithMaxPoints(maxPoints);
    }

    @GetMapping("/with-points-between")
    public List<User> getUsersWithPointsBetween(
            @RequestParam Integer min,
            @RequestParam Integer max) {
        return userService.getUsersWithPointsBetween(min, max);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User created = userService.addUser(user);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/points")
    public ResponseEntity<User> updateUserPoints(
            @PathVariable Integer id,
            @RequestParam Integer points) {
        try {
            User updated = userService.updateUserPoints(id, points);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        Optional<User> user = userService.getUserById(id);
        if (user.isPresent()) {
            userService.deleteUser(user.get());
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable Integer id) {
        try {
            User updatedUser = userService.updateUserPointsFromAnswers(id);

            UserProfileDto profile = new UserProfileDto(
                    updatedUser.getPoints(),
                    updatedUser.getStatus(),
                    calculateProgress(updatedUser.getPoints()),
                    userService.calculatePointsToNextStatus(updatedUser.getPoints())
            );

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private int calculateProgress(int points) {
        int currentLevelPoints = 0;
        int nextLevelPoints = 100;

        if (points >= 10000) return 100;
        else if (points >= 5000) {
            currentLevelPoints = 5000;
            nextLevelPoints = 10000;
        }
        else if (points >= 2500) {
            currentLevelPoints = 2500;
            nextLevelPoints = 5000;
        }
        else if (points >= 1000) {
            currentLevelPoints = 1000;
            nextLevelPoints = 2500;
        }
        else if (points >= 500) {
            currentLevelPoints = 500;
            nextLevelPoints = 1000;
        }
        else if (points >= 100) {
            currentLevelPoints = 100;
            nextLevelPoints = 500;
        }

        double progress = ((double)(points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
        return (int) Math.min(100, Math.max(0, progress));
    }
}