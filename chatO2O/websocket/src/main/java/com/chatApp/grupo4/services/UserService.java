package com.chatApp.grupo4.services;

import com.chatApp.grupo4.repository.UserRepository;
import com.chatApp.grupo4.user.Status;
import com.chatApp.grupo4.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;

    public void saveUser(User user) {
        user.setStatus(Status.ONLINE);
        repository.save(user);
    }

    public User findUserById(String id) {
        return repository.findById(id).orElse(null);
    }

    public void disconnectUser(User user) {
        var storedUser = repository.findById(user.getNickName()).orElse(null);
        if (storedUser != null) {
            storedUser.setStatus(Status.OFFLINE);
            repository.save(storedUser);
        }
    }

    public List<User> findConnectedUsers() {
        // Find all connected users
        return repository.findAllByStatus(Status.ONLINE);
    }
}
