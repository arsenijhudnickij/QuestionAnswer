package com.example.questionanswer.controller;

import com.example.questionanswer.enums.Role;
import com.example.questionanswer.model.Person;
import com.example.questionanswer.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/persons")
public class PersonController {

    @Autowired
    private PersonService personService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Person> getAllPersons() {
        return personService.findAllPersons();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.personId")
    public ResponseEntity<Person> getPersonById(@PathVariable Integer id) {
        Optional<Person> person = personService.getPersonById(id);
        return person.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/by-login/{username}")
    @PreAuthorize("hasRole('ADMIN') or #username == authentication.principal.username")
    public ResponseEntity<Person> getPersonByLogin(@PathVariable String username) {
        Optional<Person> person = personService.getPersonByLogin(username);
        return person.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/exists/{login}")
    public ResponseEntity<Boolean> checkIfPersonExists(@PathVariable String login) {
        return ResponseEntity.ok(personService.checkIfPersonExists(login));
    }

    @PostMapping
    public ResponseEntity<Person> createPerson(@RequestBody Person person) {
        if (personService.checkIfPersonExists(person.getLogin())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(personService.addPerson(person));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.personId")
    public ResponseEntity<Void> deletePerson(@PathVariable Integer id) {
        try {
            personService.deletePersonById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Person> getCurrentPerson(Principal principal) {
        String username = principal.getName();  // Имя из JWT (sub)
        Optional<Person> person = personService.getPersonByLogin(username);
        return person.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.personId")
    public ResponseEntity<Person> updatePerson(@PathVariable Integer id,
                                               @RequestBody Person personDetails) {
        if (personDetails.getPassword() != null && !personDetails.getPassword().isEmpty()) {
            personDetails.setPassword(passwordEncoder.encode(personDetails.getPassword()));
        }

        Optional<Person> updatedPerson = personService.updatePerson(id, personDetails);
        return updatedPerson.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/by-role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Person>> getPersonsByRole(@PathVariable String role) {
        try {
            Role roleEnum = Role.valueOf(role.toUpperCase());
            List<Person> persons = personService.getPersonsByRole(roleEnum);
            return ResponseEntity.ok(persons);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Person> updatePersonRole(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {

        try {
            Role newRole = Role.valueOf(request.get("role").toUpperCase());
            Optional<Person> updatedPerson = personService.updatePersonRole(id, newRole);
            return updatedPerson.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}