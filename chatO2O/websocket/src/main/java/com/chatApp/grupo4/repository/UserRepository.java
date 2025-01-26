package com.chatApp.grupo4.repository;

import com.chatApp.grupo4.user.Status;
import com.chatApp.grupo4.user.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserRepository extends MongoRepository<User, String> {
    List<User> findAllByStatus(Status status);
}
