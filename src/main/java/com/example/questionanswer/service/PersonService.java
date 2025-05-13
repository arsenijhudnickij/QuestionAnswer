package com.example.questionanswer.service;

import com.example.questionanswer.PersonDetailsImpl;
import com.example.questionanswer.enums.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.questionanswer.repository.PersonRepository;
import com.example.questionanswer.model.Person;

import java.util.List;
import java.util.Optional;

@Service
public class PersonService implements UserDetailsService {
    private PersonRepository personRepository;

    @Autowired
    public void setPersonRepository(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }
    public Person addPerson(Person person) {
        return personRepository.save(person);
    }

    public Optional<Person> getPersonById(Integer personId) {
        return personRepository.findById(personId);
    }

    public Optional<Person> getPersonByLogin(String login) {
        return personRepository.findByLogin(login);
    }

    public boolean checkIfPersonExists(String login) {
        return personRepository.existsByLogin(login);
    }

    public void deletePerson(Person person) {
        personRepository.delete(person);
    }

    public List<Person> findAllPersons() {
        return personRepository.findAll();
    }

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        Person person = personRepository.findByLogin(login).orElseThrow(() -> new UsernameNotFoundException(
                String.format("No person found with person '%s'", login)
        ));
        return PersonDetailsImpl.build(person);
    }
    public void deletePersonById(Integer id) {
        personRepository.deleteById(id);
    }
    public Optional<Person> updatePerson(Integer id, Person personDetails) {
        return personRepository.findById(id).map(person -> {
            person.setName(personDetails.getName());
            person.setSurname(personDetails.getSurname());
            person.setEmail(personDetails.getEmail());

            if (personDetails.getPassword() != null) {
                person.setPassword(personDetails.getPassword());
            }

            return personRepository.save(person);
        });
    }

    public List<Person> getPersonsByRole(Role role) {
        return personRepository.findByRole(role);
    }

    public Optional<Person> updatePersonRole(Integer id, Role newRole) {
        return personRepository.findById(id).map(person -> {
            person.setRole(newRole);
            return personRepository.save(person);
        });
    }
}