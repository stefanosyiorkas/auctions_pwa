package com.auction.backend.controller;

import com.auction.backend.entity.Auction;
import com.auction.backend.entity.Bid;
import com.auction.backend.repository.AuctionRepository;
import com.auction.backend.repository.BidRepository;
import com.auction.backend.dto.BidDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.auction.backend.service.UserService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auctions/{auctionId}/bids")
public class BidController {
    @Autowired
    private BidRepository bidRepository;
    @Autowired
    private AuctionRepository auctionRepository;
    @Autowired
    private UserService userService;

    @GetMapping
    public List<BidDTO> getBids(@PathVariable Long auctionId) {
        return bidRepository.findByAuctionId(auctionId).stream()
            .map(bid -> new BidDTO(
                bid.getId(),
                bid.getBidderUsername(),
                bid.getAmount(),
                bid.getTimestamp()
            ))
            .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> placeBid(@PathVariable Long auctionId, @RequestBody Bid bid) {
        Optional<Auction> auctionOpt = auctionRepository.findById(auctionId);
        if (auctionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Auction auction = auctionOpt.get();
        // Check if auction is finished
        if (auction.getEnds() != null && !auction.getEnds().isEmpty()) {
            java.time.LocalDateTime endTime = java.time.LocalDateTime.parse(auction.getEnds());
            if (java.time.LocalDateTime.now().isAfter(endTime)) {
                return ResponseEntity.badRequest().body("Auction has finished. Bidding is closed.");
            }
        }
        // Get current highest bid
        List<Bid> existingBids = bidRepository.findByAuctionId(auctionId);
        BigDecimal currentPrice = auction.getStartingPrice() != null ? new BigDecimal(auction.getStartingPrice()) : BigDecimal.ZERO;
        for (Bid b : existingBids) {
            if (b.getAmount() != null && b.getAmount().compareTo(currentPrice) > 0) {
                currentPrice = b.getAmount();
            }
        }
        if (bid.getAmount() == null || bid.getAmount().compareTo(currentPrice) <= 0) {
            return ResponseEntity.badRequest().body("Bid must be higher than current price");
        }
        // Set bidder username from authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        bid.setBidderUsername(username);
        bid.setAuction(auction);
        bid.setTimestamp(LocalDateTime.now());
        Bid savedBid = bidRepository.save(bid);
        BidDTO dto = new BidDTO(
            savedBid.getId(),
            savedBid.getBidderUsername(),
            savedBid.getAmount(),
            savedBid.getTimestamp()
        );
        return ResponseEntity.ok(dto);
    }
}
