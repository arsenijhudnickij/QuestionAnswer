package com.example.questionanswer.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/secured")
public class MainController {
    @GetMapping("/person")
    public String userAccess(Principal principal) {
        if (principal == null)
            return null;
        return principal.getName();
    }
}

