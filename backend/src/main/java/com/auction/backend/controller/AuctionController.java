package com.auction.backend.controller;

import com.auction.backend.entity.Auction;
import com.auction.backend.service.AuctionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.auction.backend.service.UserService;
import com.auction.backend.entity.User;
import com.auction.backend.dto.AuctionDTO;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {
    @Autowired
    private AuctionService auctionService;

    @Autowired
    private UserService userService;

    @GetMapping
    public List<AuctionDTO> getAllAuctions() {
        return auctionService.getAllAuctions().stream()
            .map(a -> new AuctionDTO(
                a.getId(),
                a.getName(),
                a.getDescription(),
                a.getCategories(),
                a.getStartingPrice(),
                a.getStarted(),
                a.getEnds(),
                a.getLocation(),
                a.getCountry(),
                a.getSellerUserId()
            ))
            .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionDTO> getAuction(@PathVariable Long id) {
        return auctionService.getAuction(id)
            .map(a -> ResponseEntity.ok(new AuctionDTO(
                a.getId(),
                a.getName(),
                a.getDescription(),
                a.getCategories(),
                a.getStartingPrice(),
                a.getStarted(),
                a.getEnds(),
                a.getLocation(),
                a.getCountry(),
                a.getSellerUserId()
            )))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Auction createAuction(@RequestBody Auction auction) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userService.findByUsername(username);
        if (user != null) {
            auction.setSellerUserId(user.getUsername());
            auction.setLocation(user.getLocation());
            auction.setCountry(user.getLocation()); // If you have a country field, use user.getCountry()
        }
        return auctionService.createAuction(auction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuction(@PathVariable Long id) {
        try {
            auctionService.deleteAuction(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/my")
    public List<AuctionDTO> getMyAuctions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return auctionService.getAuctionsBySeller(username).stream()
            .map(a -> new AuctionDTO(
                a.getId(),
                a.getName(),
                a.getDescription(),
                a.getCategories(),
                a.getStartingPrice(),
                a.getStarted(),
                a.getEnds(),
                a.getLocation(),
                a.getCountry(),
                a.getSellerUserId()
            ))
            .toList();
    }
}
