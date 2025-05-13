package com.example.questionanswer.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.questionanswer.repository.AdminRepository;
import com.example.questionanswer.model.Admin;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {
    private AdminRepository adminRepository;

    @Autowired
    public void setAdminRepository(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public Admin addAdmin(Admin admin) {
        return adminRepository.save(admin);
    }

    public Optional<Admin> getAdminById(Integer adminId) {
        return adminRepository.findById(adminId);
    }

    public Optional<Admin> getAdminByPersonId(Integer personId) {
        return adminRepository.findByPerson_PersonId(personId);
    }

    public void deleteAdmin(Admin admin) {
        adminRepository.delete(admin);
    }

    public List<Admin> findAllAdmins() {
        return adminRepository.findAll();
    }
}