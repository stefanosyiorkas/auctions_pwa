package com.auction.backend.service;

import com.auction.backend.entity.Message;
import com.auction.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {
    @Autowired
    private MessageRepository messageRepository;

    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }

    public List<Message> getInbox(String username) {
        return messageRepository.findByRecipientAndIsDeletedByRecipientFalseOrderByTimestampDesc(username);
    }

    public List<Message> getSent(String username) {
        return messageRepository.findBySenderAndIsDeletedBySenderFalseOrderByTimestampDesc(username);
    }

    public void deleteMessage(Long id, String username) {
        Message msg = messageRepository.findById(id).orElse(null);
        if (msg != null) {
            if (username.equals(msg.getSender())) {
                msg.setDeletedBySender(true);
            }
            if (username.equals(msg.getRecipient())) {
                msg.setDeletedByRecipient(true);
            }
            messageRepository.save(msg);
        }
    }

    public List<Message> getThread(Long auctionId, String user1, String user2) {
        List<Message> all = messageRepository.findByAuctionIdAndSenderAndRecipientOrAuctionIdAndSenderAndRecipientOrderByTimestampAsc(
            auctionId, user1, user2, auctionId, user2, user1
        );
        // Only show messages not deleted by the current user
        return all.stream().filter(m ->
            !(user1.equals(m.getSender()) && m.isDeletedBySender()) &&
            !(user1.equals(m.getRecipient()) && m.isDeletedByRecipient())
        ).toList();
    }

    public void markAsRead(Long id, String username) {
        Message msg = messageRepository.findById(id).orElse(null);
        if (msg != null && username.equals(msg.getRecipient()) && !msg.isRead()) {
            msg.setRead(true);
            messageRepository.save(msg);
        }
    }
}
