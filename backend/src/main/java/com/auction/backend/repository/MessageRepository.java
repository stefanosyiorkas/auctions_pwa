package com.auction.backend.repository;

import com.auction.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByRecipientAndIsDeletedByRecipientFalseOrderByTimestampDesc(String recipient);
    List<Message> findBySenderAndIsDeletedBySenderFalseOrderByTimestampDesc(String sender);
    List<Message> findByAuctionIdAndSenderAndRecipientOrAuctionIdAndSenderAndRecipientOrderByTimestampAsc(
        Long auctionId, String sender1, String recipient1, Long auctionId2, String sender2, String recipient2);
}
