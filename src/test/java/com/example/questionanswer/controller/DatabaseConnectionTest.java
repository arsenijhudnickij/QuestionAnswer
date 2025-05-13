package com.example.questionanswer.controller;

import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Connection;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class DatabaseConnectionTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    public void testDatabaseConnection() throws SQLException {
        assertNotNull(dataSource, "DataSource не должен быть null");

        try (Connection connection = dataSource.getConnection()) {
            assertTrue(connection.isValid(2), "Подключение к базе данных должно быть валидным");
        }

        assertNotNull(jdbcTemplate, "JdbcTemplate не должен быть null");

        Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        assertNotNull(result, "Результат запроса не должен быть null");
        assertEquals(1, result, "Результат запроса должен быть равен 1");
    }
}
