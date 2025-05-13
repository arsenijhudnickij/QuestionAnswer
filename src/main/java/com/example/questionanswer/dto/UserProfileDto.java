package com.example.questionanswer.dto;

import com.example.questionanswer.enums.Status;

public class UserProfileDto {
    private int points;
    private Status status;
    private double progress;
    private int pointsToNextStatus;

    public UserProfileDto(int points, Status status, double progress, int pointsToNextStatus) {
        this.points = points;
        this.status = status;
        this.progress = progress;
        this.pointsToNextStatus = pointsToNextStatus;
    }

    // Геттеры
    public int getPoints() {
        return points;
    }

    public Status getStatus() {
        return status;
    }

    public double getProgress() {
        return progress;
    }

    public int getPointsToNextStatus() {
        return pointsToNextStatus;
    }
}