# SensayApi.V1ReplicasReplicaUUIDChatHistoryTelegramPostRequestTelegramData

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**chatType** | **String** | Type of the chat, can be either &#x60;private&#x60;, &#x60;group&#x60;, &#x60;supergroup&#x60; or &#x60;channel&#x60;. | 
**chatId** | **Number** | Unique identifier for this chat. | 
**userId** | **Number** | Sender of the message&#39;s userID; may be empty for messages sent to channels. For backward compatibility, if the message was sent on behalf of a chat, the field contains a fake sender user in non-channel chats. | [optional] 
**username** | **String** | Sender of the message&#39;s username; may be empty for messages sent to channels. For backward compatibility, if the message was sent on behalf of a chat, the field contains a fake sender user in non-channel chats. | [optional] 
**messageId** | **Number** | Unique message identifier inside this chat. In specific instances (e.g., message containing a video sent to a big chat). | 
**messageThreadId** | **Number** | Unique identifier of a message thread or a forum topic to which the message belongs; for supergroups only. | [optional] 


