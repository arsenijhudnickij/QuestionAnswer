package com.example.questionanswer.enums;

public enum Theme {
    MATHS("Математика"),
    PHYSICS("Физика"),
    CHEMISTRY("Химия"),
    LANGUAGES("Языки"),
    HISTORY("История"),
    LITERATURE("Литература"),
    LIFE("Жизнь");

    private final String displayName;

    Theme(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}