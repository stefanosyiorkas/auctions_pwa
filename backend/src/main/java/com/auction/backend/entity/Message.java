package com.auction.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sender;
    private String recipient;
    private Long auctionId;
    private String content;
    private LocalDateTime timestamp;
    private boolean isRead = false;
    private boolean isDeletedBySender = false;
    private boolean isDeletedByRecipient = false;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }
    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public boolean isDeletedBySender() { return isDeletedBySender; }
    public void setDeletedBySender(boolean deletedBySender) { isDeletedBySender = deletedBySender; }
    public boolean isDeletedByRecipient() { return isDeletedByRecipient; }
    public void setDeletedByRecipient(boolean deletedByRecipient) { isDeletedByRecipient = deletedByRecipient; }
}
