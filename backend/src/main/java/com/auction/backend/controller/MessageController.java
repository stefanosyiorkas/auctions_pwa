package com.auction.backend.controller;

import com.auction.backend.entity.Message;
import com.auction.backend.entity.Auction;
import com.auction.backend.entity.Bid;
import com.auction.backend.repository.AuctionRepository;
import com.auction.backend.repository.BidRepository;
import com.auction.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageService messageService;
    @Autowired
    private AuctionRepository auctionRepository;
    @Autowired
    private BidRepository bidRepository;

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody Message message) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String sender = auth.getName();
        message.setSender(sender);
        message.setTimestamp(LocalDateTime.now());
        Auction auction = auctionRepository.findById(message.getAuctionId()).orElse(null);
        if (auction == null) return ResponseEntity.badRequest().body("Auction not found");
        // Robustly check if auction is finished (handle UTC/ISO 8601)
        if (auction.getEnds() == null) {
            return ResponseEntity.badRequest().body("Auction not finished");
        }
        try {
            java.time.Instant auctionEndInstant;
            String endsStr = auction.getEnds();
            System.out.println("[DEBUG] auction.getEnds(): " + endsStr);
            try {
                if (endsStr.endsWith("Z") || endsStr.matches(".*[+-]\\d{2}:?\\d{2}$")) {
                    // ISO 8601 with timezone
                    auctionEndInstant = java.time.Instant.parse(endsStr.replace(" ", "T"));
                } else if (endsStr.matches("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$")) {
                    // No timezone, treat as UTC
                    auctionEndInstant = java.time.LocalDateTime.parse(endsStr).atZone(java.time.ZoneOffset.UTC).toInstant();
                } else if (endsStr.matches("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}$")) {
                    // No seconds, treat as UTC
                    auctionEndInstant = java.time.LocalDateTime.parse(endsStr + ":00").atZone(java.time.ZoneOffset.UTC).toInstant();
                } else {
                    // Fallback: try parsing as LocalDateTime in UTC
                    auctionEndInstant = java.time.LocalDateTime.parse(endsStr).atZone(java.time.ZoneOffset.UTC).toInstant();
                }
            } catch (Exception e) {
                System.out.println("[DEBUG] Fallback parsing failed: " + e.getMessage());
                // Try parsing as LocalDateTime with seconds forced to 00
                try {
                    auctionEndInstant = java.time.LocalDateTime.parse(endsStr + ":00").atZone(java.time.ZoneOffset.UTC).toInstant();
                } catch (Exception e2) {
                    System.out.println("[DEBUG] Final fallback parsing failed: " + e2.getMessage());
                    return ResponseEntity.badRequest().body("Invalid auction end time format");
                }
            }
            // Add 3 hours to server time to match local time
            java.time.Instant nowPlus3Hours = java.time.Instant.now().plus(java.time.Duration.ofHours(3));
            System.out.println("[DEBUG] Parsed auctionEndInstant: " + auctionEndInstant + ", now: " + nowPlus3Hours);
            if (nowPlus3Hours.isBefore(auctionEndInstant)) {
                return ResponseEntity.badRequest().body("Auction not finished");
            }
        } catch (Exception e) {
            System.out.println("[DEBUG] Exception in auction end time check: " + e.getMessage());
            return ResponseEntity.badRequest().body("Invalid auction end time format");
        }
        // Find winner
        List<Bid> bids = bidRepository.findByAuctionId(auction.getId());
        Bid winner = bids.stream().max((b1, b2) -> b1.getAmount().compareTo(b2.getAmount())).orElse(null);
        if (winner == null) {
            return ResponseEntity.status(403).body("No winner for this auction");
        }
        String winnerUsername = winner.getBidderUsername();
        String sellerUsername = auction.getSellerUserId();
        // Allow both winner and seller to message each other
        boolean validDirection =
            (sender.equals(winnerUsername) && message.getRecipient().equals(sellerUsername)) ||
            (sender.equals(sellerUsername) && message.getRecipient().equals(winnerUsername));
        if (!validDirection) {
            return ResponseEntity.status(403).body("Only the winner and seller can message each other");
        }
        messageService.saveMessage(message);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/inbox")
    public List<Message> getInbox() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return messageService.getInbox(username);
    }

    @GetMapping("/sent")
    public List<Message> getSent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return messageService.getSent(username);
    }

    @GetMapping("/thread")
    public List<Message> getThread(@RequestParam Long auctionId, @RequestParam String user) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUser = auth.getName();
        return messageService.getThread(auctionId, currentUser, user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        messageService.deleteMessage(id, username);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        messageService.markAsRead(id, username);
        return ResponseEntity.ok().build();
    }
}
