package com.group4.websocket.groupmessage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/messages")
public class GroupMessageController {

  private static final Logger logger = LoggerFactory.getLogger(GroupMessageController.class);

  @Autowired
  private GroupMessageService groupMessageService;

  @MessageMapping("/messages/rooms/{roomId}")
  @SendTo("/topic/rooms/{roomId}")
  public GroupMessage sendMessageToRoom(@DestinationVariable String roomId, @RequestBody GroupMessage message) {
    logger.info("Received message: {}", message);

    message.setRoomId(roomId);
    groupMessageService.saveMessage(message);
    return message;
  }


  @GetMapping("/rooms/{roomId}")
  public List<GroupMessage> getMessagesByRoomId(@PathVariable String roomId) {
    return groupMessageService.getMessagesByRoomId(roomId);
  }
}
