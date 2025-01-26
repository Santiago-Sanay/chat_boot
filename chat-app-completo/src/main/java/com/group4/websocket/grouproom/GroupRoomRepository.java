package com.group4.websocket.grouproom;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface GroupRoomRepository extends MongoRepository<GroupRoom, String> {
  Optional<GroupRoom> findByRoomId(String roomId);
  List<GroupRoom> findByParticipantsContaining(String userId);
}
