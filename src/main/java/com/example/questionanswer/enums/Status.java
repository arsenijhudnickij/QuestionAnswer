package com.example.questionanswer.enums;

public enum Status {
    STUDENT("Студент"),
    UNDERGRAND("Аспирант"),
    CONNOISSEUR("Знаток"),
    EXPERT("Эксперт"),
    SCIENTIST("Ученый"),
    MASTER("Мастер"),
    GENIUS("Гений");

    private final String displayName;

    Status(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}