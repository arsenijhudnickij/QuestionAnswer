package com.example.questionanswer.controller;

import com.example.questionanswer.JwtCore;
import com.example.questionanswer.authentication.SignInRequest;
import com.example.questionanswer.authentication.SignUpRequest;
import com.example.questionanswer.enums.Role;
import com.example.questionanswer.enums.Status;
import com.example.questionanswer.model.Person;
import com.example.questionanswer.model.User;
import com.example.questionanswer.repository.PersonRepository;
import com.example.questionanswer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class SecurityController {

    private PersonRepository personRepository;
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private AuthenticationManager authenticationManager;
    private JwtCore jwtCore;

    @Autowired
    public void setPersonRepository(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }
    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Autowired
    public void setAuthenticationManager(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @Autowired
    public void setJwtCore(JwtCore jwtCore) {
        this.jwtCore = jwtCore;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignUpRequest signupRequest) {
        Map<String, String> errors = new HashMap<>();

        if (personRepository.existsByLogin(signupRequest.getLogin())) {
            errors.put("loginError", "Этот логин уже занят. Пожалуйста, выберите другой.");
        }
        if (personRepository.existsByEmail(signupRequest.getEmail())) {
            errors.put("emailError", "Эта почта уже зарегистрирована. Используйте другую почту.");
        }

        if (!errors.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        }

        try {
            Person person = new Person();
            person.setLogin(signupRequest.getLogin());
            person.setEmail(signupRequest.getEmail());
            person.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
            person.setName(signupRequest.getName());
            person.setSurname(signupRequest.getSurname());
            person.setBirthdate(signupRequest.getBirthdate());
            person.setRole(Role.USER);
            person = personRepository.save(person);

            User user = new User();
            user.setPerson(person);
            user.setPoints(0);
            user.setStatus(Status.STUDENT);
            userRepository.save(user);

            return ResponseEntity.ok(Collections.singletonMap("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("serverError", "Ошибка сервера. Пожалуйста, попробуйте позже."));
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody SignInRequest signinRequest) {
        Optional<Person> optionalPerson = personRepository.findByLogin(signinRequest.getLogin());
        if (!optionalPerson.isPresent()) {
            return new ResponseEntity<>("Person not found", HttpStatus.UNAUTHORIZED);
        }

        Person person = optionalPerson.get();

        if (!passwordEncoder.matches(signinRequest.getPassword(), person.getPassword())) {
            return new ResponseEntity<>("Invalid password", HttpStatus.UNAUTHORIZED);
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(signinRequest.getLogin(), signinRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtCore.generateToken(authentication);
        String role = person.getRole().toString();

        return ResponseEntity.ok(Map.of(
                "token", jwt,
                "role", role
        ));
    }
}
