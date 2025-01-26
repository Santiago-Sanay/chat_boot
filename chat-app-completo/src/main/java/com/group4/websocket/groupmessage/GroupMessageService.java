package com.group4.websocket.groupmessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GroupMessageService {

  @Autowired
  private GroupMessageRepository groupMessageRepository;

  public void saveMessage(GroupMessage message) {
    groupMessageRepository.save(message);
  }

  public List<GroupMessage> getMessagesByRoomId(String roomId) {
    return groupMessageRepository.findByRoomId(roomId);
  }
}
