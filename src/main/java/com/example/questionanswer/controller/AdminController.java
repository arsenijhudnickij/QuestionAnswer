package com.example.questionanswer.controller;

import com.example.questionanswer.model.Admin;
import com.example.questionanswer.model.Person;
import com.example.questionanswer.repository.PersonRepository;
import com.example.questionanswer.service.AdminService;
import com.example.questionanswer.service.PersonService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/admins")
public class AdminController {

    @Autowired
    private AdminService adminService;
    @Autowired
    private PersonRepository personRepository;

    @GetMapping
    public List<Admin> getAllAdmins() {
        return adminService.findAllAdmins();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Admin> getAdminById(@PathVariable Integer id) {
        Optional<Admin> admin = adminService.getAdminById(id);
        return admin.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/person/{personId}")
    public ResponseEntity<Admin> getAdminByPersonId(@PathVariable Integer personId) {
        Optional<Admin> admin = adminService.getAdminByPersonId(personId);
        return admin.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Integer id) {
        Optional<Admin> admin = adminService.getAdminById(id);
        if (admin.isPresent()) {
            adminService.deleteAdmin(admin.get());
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Admin> createAdmin(@RequestBody Admin adminRequest) {
        try {
            Person person = personRepository.findById(adminRequest.getPerson().getPersonId())
                    .orElseThrow(() -> new EntityNotFoundException("Person not found"));

            Admin admin = new Admin();
            admin.setPerson(person);
            Admin savedAdmin = adminService.addAdmin(admin);

            return ResponseEntity.ok(savedAdmin);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}