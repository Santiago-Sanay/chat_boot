package com.group4.websocket.grouproom;

import com.group4.websocket.user.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupRoomService {

  private final GroupRoomRepository groupRoomRepository;
  private static final Logger logger = LoggerFactory.getLogger(GroupRoomService.class);

  public GroupRoom createRoom(String roomId, String creatorId) {
    GroupRoom newRoom = GroupRoom.builder()
      .roomId(roomId)
      .creatorId(creatorId)
      .participants(new ArrayList<>())
      .build();
    newRoom.addParticipant(creatorId);
    return groupRoomRepository.save(newRoom);
  }

  @Autowired
  private UserService userService;

  public Optional<GroupRoom> addParticipant(String roomId, String userId) {
    Optional<GroupRoom> groupRoomOptional = groupRoomRepository.findByRoomId(roomId);
    if (groupRoomOptional.isPresent()) {
      GroupRoom groupRoom = groupRoomOptional.get();

      groupRoom.addParticipant(userId);
      logger.info("Preparing to save GroupRoom. Room ID: {}", groupRoom.getRoomId());
      logger.info("Participants: {}", groupRoom.getParticipants().stream()
        .collect(Collectors.joining(", ")));

      groupRoomRepository.save(groupRoom);
      return Optional.of(groupRoom);
    }
    return Optional.empty();
  }

  public List<GroupRoom> findRoomsByUserId(String userId) {
    return groupRoomRepository.findByParticipantsContaining(userId);
  }

  public Optional<GroupRoom> findByRoomId(String roomId) {
    return groupRoomRepository.findByRoomId(roomId);
  }
}
