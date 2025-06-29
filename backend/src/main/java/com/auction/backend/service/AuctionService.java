package com.auction.backend.service;

import com.auction.backend.entity.Auction;
import com.auction.backend.repository.AuctionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuctionService {
    @Autowired
    private AuctionRepository auctionRepository;

    public List<Auction> getAllAuctions() {
        return auctionRepository.findAll();
    }

    public Optional<Auction> getAuction(Long id) {
        return auctionRepository.findById(id);
    }

    public Auction createAuction(Auction auction) {
        return auctionRepository.save(auction);
    }

    public void deleteAuction(Long id) {
        Optional<Auction> auctionOpt = auctionRepository.findById(id);
        if (auctionOpt.isPresent()) {
            Auction auction = auctionOpt.get();
            // Only allow delete if auction has not started (current date < started)
            if (auction.getStarted() == null || auction.getStarted().isEmpty()) {
                auctionRepository.deleteById(id);
            } else {
                try {
                    java.time.LocalDateTime now = java.time.LocalDateTime.now();
                    java.time.LocalDateTime start = java.time.LocalDateTime.parse(auction.getStarted());
                    if (now.isBefore(start)) {
                        auctionRepository.deleteById(id);
                    } else {
                        throw new IllegalStateException("Cannot delete auction that has started");
                    }
                } catch (Exception e) {
                    throw new IllegalStateException("Invalid start date format");
                }
            }
        }
    }

    public List<Auction> getAuctionsBySeller(String sellerUserId) {
        return auctionRepository.findBySellerUserId(sellerUserId);
    }
}
