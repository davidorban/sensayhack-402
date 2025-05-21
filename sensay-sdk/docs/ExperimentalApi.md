# SensayApi.ExperimentalApi

All URIs are relative to *https://api.sensay.io*

Method | HTTP request | Description
------------- | ------------- | -------------
[**v1ExperimentalReplicasReplicaUUIDChatCompletionsPost**](ExperimentalApi.md#v1ExperimentalReplicasReplicaUUIDChatCompletionsPost) | **POST** /v1/experimental/replicas/{replicaUUID}/chat/completions | Generate a completion (OpenAI-compatible, non-streaming)



## v1ExperimentalReplicasReplicaUUIDChatCompletionsPost

> V1ExperimentalReplicasReplicaUUIDChatCompletionsPost200Response v1ExperimentalReplicasReplicaUUIDChatCompletionsPost(replicaUUID, opts)

Generate a completion (OpenAI-compatible, non-streaming)

   &gt; warn   &gt; Limited [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat/create) compatibility.   &gt; Supports basic chat completion with standard message roles and JSON responses.   &gt; Not supported: OpenAI-style streaming, tool calls, stop sequences, logprobs, and most request parameters.    Creates a chat completion response from a list of messages comprising a conversation.   

### Example

```javascript
import SensayApi from 'sensay_api';
let defaultClient = SensayApi.ApiClient.instance;
// Configure API key authorization: OrganizationServiceToken
let OrganizationServiceToken = defaultClient.authentications['OrganizationServiceToken'];
OrganizationServiceToken.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//OrganizationServiceToken.apiKeyPrefix = 'Token';
// Configure API key authorization: UserID
let UserID = defaultClient.authentications['UserID'];
UserID.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//UserID.apiKeyPrefix = 'Token';

let apiInstance = new SensayApi.ExperimentalApi();
let replicaUUID = "replicaUUID_example"; // String | 
let opts = {
  'v1ExperimentalReplicasReplicaUUIDChatCompletionsPostRequest': new SensayApi.V1ExperimentalReplicasReplicaUUIDChatCompletionsPostRequest() // V1ExperimentalReplicasReplicaUUIDChatCompletionsPostRequest | 
};
apiInstance.v1ExperimentalReplicasReplicaUUIDChatCompletionsPost(replicaUUID, opts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **replicaUUID** | **String**|  | 
 **v1ExperimentalReplicasReplicaUUIDChatCompletionsPostRequest** | [**V1ExperimentalReplicasReplicaUUIDChatCompletionsPostRequest**](V1ExperimentalReplicasReplicaUUIDChatCompletionsPostRequest.md)|  | [optional] 

### Return type

[**V1ExperimentalReplicasReplicaUUIDChatCompletionsPost200Response**](V1ExperimentalReplicasReplicaUUIDChatCompletionsPost200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken), [UserID](../README.md#UserID)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

