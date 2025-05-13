package com.example.questionanswer;

import com.example.questionanswer.model.Person;
import com.example.questionanswer.enums.Role;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
public class PersonDetailsImpl implements UserDetails {
    private Integer id;
    private String name;
    private String surname;
    private String login;
    private String email;
    private String password;
    private Role role;

    public PersonDetailsImpl(Integer id, String name, String surname, String login,
                             String email, String password, Role role) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.login = login;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public static PersonDetailsImpl build(Person person) {
        return new PersonDetailsImpl(
                person.getPersonId(),
                person.getName(),
                person.getSurname(),
                person.getLogin(),
                person.getEmail(),
                person.getPassword(),
                person.getRole());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return login; // Используем login как username для аутентификации
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public String getFullName() {
        return name + " " + surname;
    }
}