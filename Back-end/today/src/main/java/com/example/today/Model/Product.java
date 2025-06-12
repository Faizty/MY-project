package com.example.today.Model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {
    @Id
    private String id;
    private String name;
    private String description;

    @Column(columnDefinition = "TEXT")
    private String fullDescription;

    private Double price;
    private Integer discount;
    private String image;

    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> images;

    private String category;
    private String brand;
    private Double rating;
    private Integer reviews;
    private Integer stock;

    @JsonIgnore
    private Instant createdAt;

    @Column(name = "seller_id")
    private Long sellerId;

    @ElementCollection
    @CollectionTable(name = "product_specifications", joinColumns = @JoinColumn(name = "product_id"))
    private List<Specification> specifications;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFullDescription() { return fullDescription; }
    public void setFullDescription(String fullDescription) { this.fullDescription = fullDescription; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getDiscount() { return discount; }
    public void setDiscount(Integer discount) { this.discount = discount; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviews() { return reviews; }
    public void setReviews(Integer reviews) { this.reviews = reviews; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    @JsonIgnore
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Long getSeller_id() { return sellerId; }
    public void setSeller_id(Long sellerId) { this.sellerId = sellerId; }

    public List<Specification> getSpecifications() { return specifications; }
    public void setSpecifications(List<Specification> specifications) {
        this.specifications = specifications;
    }
}