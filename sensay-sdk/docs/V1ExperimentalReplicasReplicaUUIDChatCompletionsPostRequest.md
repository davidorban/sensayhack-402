# SensayApi.V1ExperimentalReplicasReplicaUUIDChatCompletionsPostRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**messages** | [**[V1ExperimentalReplicasReplicaUUIDChatCompletionsPostRequestMessagesInner]**](V1ExperimentalReplicasReplicaUUIDChatCompletionsPostRequestMessagesInner.md) | A list of messages that make up the conversation context. Only the last message is used for completion. | 
**store** | **Boolean** | When set to false, historical messages are not used in the context, and the message is not appended to the conversation history. | [optional] [default to true]
**source** | **String** | The place where the conversation is happening, which informs where the message should be saved in the chat history if &#x60;store&#x60; is true. | [optional] [default to &#39;web&#39;]
**discordData** | [**V1ReplicasReplicaUUIDChatHistoryPostRequestDiscordData**](V1ReplicasReplicaUUIDChatHistoryPostRequestDiscordData.md) |  | [optional] 



## Enum: SourceEnum


* `discord` (value: `"discord"`)

* `embed` (value: `"embed"`)

* `web` (value: `"web"`)




