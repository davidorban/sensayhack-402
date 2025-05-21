# SensayApi.V1ReplicasReplicaUUIDChatCompletionsPostRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**content** | **String** | The prompt to generate completions for, encoded as a string. | 
**skipChatHistory** | **Boolean** | When set to true, historical messages are not used in the context, and the message is not appended to the conversation history, thus it is excluded from all future chat context. | [optional] [default to false]
**source** | **String** | The place where the conversation is happening, which informs where the message should be saved in the chat history. | [optional] 
**discordData** | [**V1ReplicasReplicaUUIDChatHistoryPostRequestDiscordData**](V1ReplicasReplicaUUIDChatHistoryPostRequestDiscordData.md) |  | [optional] 



## Enum: SourceEnum


* `discord` (value: `"discord"`)

* `telegram` (value: `"telegram"`)

* `embed` (value: `"embed"`)

* `web` (value: `"web"`)

* `telegram_autopilot` (value: `"telegram_autopilot"`)




