package com.knowledgeguru.backend.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.List;

/** Attached to the SecurityContext for every authenticated request; equivalent of `req.user`. */
public class UserPrincipal extends User {
    private final String id;
    private final String name;
    private final String email;
    private final String role;

    public UserPrincipal(String id, String name, String email, String role) {
        super(email, "", List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())));
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }
    public String getId() {
        return this.id;
    }

    public String getName() {
        return this.name;
    }

    public String getEmail() {
        return this.email;
    }

    public String getRole() {
        return this.role;
    }
}
