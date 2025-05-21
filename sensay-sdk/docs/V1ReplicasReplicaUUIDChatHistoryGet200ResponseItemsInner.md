# SensayApi.V1ReplicasReplicaUUIDChatHistoryGet200ResponseItemsInner

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**content** | **String** | The content of the message | 
**createdAt** | **Date** | The date and time the message was created | 
**id** | **Number** | The ID of the message | 
**isPrivate** | **Boolean** | Whether the replica is private | 
**role** | **String** | The role of the message | 
**source** | **String** | From which platform is message was sent from | 
**sources** | [**[V1ReplicasReplicaUUIDChatHistoryGet200ResponseItemsInnerSourcesInner]**](V1ReplicasReplicaUUIDChatHistoryGet200ResponseItemsInnerSourcesInner.md) | The sources of information used to create the response via RAG (Retrieval-Augmented Generation) | 
**userUuid** | **String** | The UUID of the user | 
**originalMessageId** | **String** | The ID of the message from the LLM. Present when role is assistant. Will be removed in the future. | 



## Enum: RoleEnum


* `user` (value: `"user"`)

* `assistant` (value: `"assistant"`)





## Enum: SourceEnum


* `discord` (value: `"discord"`)

* `telegram` (value: `"telegram"`)

* `embed` (value: `"embed"`)

* `web` (value: `"web"`)

* `telegram_autopilot` (value: `"telegram_autopilot"`)




