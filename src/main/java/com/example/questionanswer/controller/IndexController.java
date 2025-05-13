package com.example.questionanswer.controller;

import com.example.questionanswer.service.PersonService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class IndexController {
    private final PersonService personService;

    public IndexController(PersonService personService) {
        this.personService = personService;
    }

    @GetMapping("/")
    public String main() { return "main"; }
    @GetMapping("/signup")
    public String ShowSignupPage() { return "signup"; }
    @GetMapping("/signin")
    public String ShowSigninPage() { return "signin";}
    @GetMapping("/aboutus")
    public String ShowAboutUsPage() { return "aboutus";}
    @GetMapping("/info")
    public String ShowInfoPage() { return "info";}
    @GetMapping("/userpage")
    public String ShowUserPage() { return "userpage";}
    @GetMapping("/adminpage")
    public String ShowAdminPage() { return "adminpage";}
}
