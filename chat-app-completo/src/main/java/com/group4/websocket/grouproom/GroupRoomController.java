package com.group4.websocket.grouproom;

import com.group4.websocket.user.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Controller
@CrossOrigin(origins = "*")
public class GroupRoomController {

  private static final Logger logger = LoggerFactory.getLogger(GroupRoomController.class);

  @Autowired
  private GroupRoomService groupRoomService;

  @Autowired
  private UserService userService;

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  @MessageMapping("/group/create")
  public void createRoom(GroupRoom request) {
    GroupRoom createdRoom = groupRoomService.createRoom(request.getRoomId(), request.getCreatorId());

    messagingTemplate.convertAndSendToUser(request.getCreatorId(), "/queue/rooms", createdRoom);
  }



  @MessageMapping("/group/{roomId}/{userId}")
  public void addParticipant(@DestinationVariable String roomId, @DestinationVariable String userId) {
    logger.info("Adding participant. Room ID: {}, User ID: {}", roomId, userId);
    groupRoomService.addParticipant(roomId, userId);
    Optional<GroupRoom> updatedRoom = groupRoomService.findByRoomId(roomId);

    List<String> participantIds = updatedRoom
      .map(GroupRoom::getParticipants)
      .orElse(Collections.emptyList());

    participantIds.forEach(participantId -> {
      messagingTemplate.convertAndSend("/topic/rooms/" + participantId, updatedRoom);
    });
  }



  @GetMapping("/user/{userId}/rooms")
  @ResponseBody
  public List<GroupRoom> getUserRooms(@PathVariable String userId) {
    return groupRoomService.findRoomsByUserId(userId);
  }
}
