package com.auction.backend.repository;

import com.auction.backend.entity.Auction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuctionRepository extends JpaRepository<Auction, Long> {
    List<Auction> findBySellerUserId(String sellerUserId);
}
