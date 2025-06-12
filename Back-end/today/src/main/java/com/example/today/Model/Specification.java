package com.example.today.Model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Specification {
    private String name;
    private String value;

    // Getters
    public String getName() { return name; }
    public String getValue() { return value; }

    // Setters
    public void setName(String name) { this.name = name; }
    public void setValue(String value) { this.value = value; }
}