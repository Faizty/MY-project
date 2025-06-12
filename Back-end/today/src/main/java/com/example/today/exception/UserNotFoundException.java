package com.example.today.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long id) {
        super("User with ID " + id + " not found.");
    }

    public UserNotFoundException(String message) {
        super(message);
    }
}
