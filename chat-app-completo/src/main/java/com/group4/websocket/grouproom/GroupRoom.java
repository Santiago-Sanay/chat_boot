package com.group4.websocket.grouproom;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document
public class GroupRoom {
  @Id
  private String id;
  private String creatorId;
  private String roomId;
  private List<String> participants;

  public void addParticipant(String user) {
    if (participants == null) {
      participants = new ArrayList<>();
    }
    participants.add(user);
  }
}
