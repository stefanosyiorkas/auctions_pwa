package com.auction.backend.dto;

public class AuctionDTO {
    private Long id;
    private String name;
    private String description;
    private String categories;
    private Double startingPrice;
    private String started;
    private String ends;
    private String location;
    private String country;
    private String sellerUserId;

    public AuctionDTO() {}
    public AuctionDTO(Long id, String name, String description, String categories, Double startingPrice, String started, String ends, String location, String country, String sellerUserId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.categories = categories;
        this.startingPrice = startingPrice;
        this.started = started;
        this.ends = ends;
        this.location = location;
        this.country = country;
        this.sellerUserId = sellerUserId;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategories() { return categories; }
    public void setCategories(String categories) { this.categories = categories; }
    public Double getStartingPrice() { return startingPrice; }
    public void setStartingPrice(Double startingPrice) { this.startingPrice = startingPrice; }
    public String getStarted() { return started; }
    public void setStarted(String started) { this.started = started; }
    public String getEnds() { return ends; }
    public void setEnds(String ends) { this.ends = ends; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getSellerUserId() { return sellerUserId; }
    public void setSellerUserId(String sellerUserId) { this.sellerUserId = sellerUserId; }
}
