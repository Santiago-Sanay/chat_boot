package com.group4.websocket.groupmessage;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface GroupMessageRepository extends MongoRepository<GroupMessage, String> {
  List<GroupMessage> findByRoomId(String roomId);
}
