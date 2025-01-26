package com.group4.websocket.groupmessage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document
public class GroupMessage {
  @Id
  private String id;
  private String roomId;
  private String senderId;
  private String content;
  private Date timestamp;
}
