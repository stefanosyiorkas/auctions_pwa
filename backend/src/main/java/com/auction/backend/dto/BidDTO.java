package com.auction.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BidDTO {
    private Long id;
    private String bidderUsername;
    private BigDecimal amount;
    private LocalDateTime timestamp;

    public BidDTO() {}
    public BidDTO(Long id, String bidderUsername, BigDecimal amount, LocalDateTime timestamp) {
        this.id = id;
        this.bidderUsername = bidderUsername;
        this.amount = amount;
        this.timestamp = timestamp;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBidderUsername() { return bidderUsername; }
    public void setBidderUsername(String bidderUsername) { this.bidderUsername = bidderUsername; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
