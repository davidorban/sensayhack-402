# SensayApi.V1ReplicasReplicaUUIDChatCompletionsTelegramPostRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**content** | **String** | The prompt to generate completions for, encoded as a string. | 
**skipChatHistory** | **Boolean** | When set to true, historical messages are not used in the context, and the message is not appended to the conversation history, thus it is excluded from all future chat context. | [optional] [default to false]
**imageURL** | **String** | The URL of the image to be used as context for the completion. | [optional] 
**telegramData** | [**V1ReplicasReplicaUUIDChatHistoryTelegramPostRequestTelegramData**](V1ReplicasReplicaUUIDChatHistoryTelegramPostRequestTelegramData.md) |  | 


