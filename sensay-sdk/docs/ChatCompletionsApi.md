# SensayApi.ChatCompletionsApi

All URIs are relative to *https://api.sensay.io*

Method | HTTP request | Description
------------- | ------------- | -------------
[**v1ExperimentalReplicasReplicaUUIDChatCompletionsPost**](ChatCompletionsApi.md#v1ExperimentalReplicasReplicaUUIDChatCompletionsPost) | **POST** /v1/experimental/replicas/{replicaUUID}/chat/completions | Generate a completion (OpenAI-compatible, non-streaming)
[**v1ReplicasReplicaUUIDChatCompletionsPost**](ChatCompletionsApi.md#v1ReplicasReplicaUUIDChatCompletionsPost) | **POST** /v1/replicas/{replicaUUID}/chat/completions | Generate a completion



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

let apiInstance = new SensayApi.ChatCompletionsApi();
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


## v1ReplicasReplicaUUIDChatCompletionsPost

> V1ReplicasReplicaUUIDChatCompletionsPost200Response v1ReplicasReplicaUUIDChatCompletionsPost(replicaUUID, opts)

Generate a completion

   Ask for a completion and stores the prompt in the chat history.    Replica chat supports two response formats: streamed and JSON. To switch between these formats, use the &#39;Accept&#39; header, specifying either &#39;text/event-stream&#39; for streaming or &#39;application/json&#39; for JSON.   The streamed response honours the [Stream Protocol](https://sdk.vercel.ai/docs/ai-sdk-ui/stream-protocol), allowing the use of a number of SDKs, including [Vercel AI SDK](https://sdk.vercel.ai/docs/introduction).    The streamed variant is not specified in the OpenAPI Schema because it is not an OpenAPI endpoint.   

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

let apiInstance = new SensayApi.ChatCompletionsApi();
let replicaUUID = "replicaUUID_example"; // String | 
let opts = {
  'xAPIVersion': "2025-03-25", // String | 
  'v1ReplicasReplicaUUIDChatCompletionsPostRequest': new SensayApi.V1ReplicasReplicaUUIDChatCompletionsPostRequest() // V1ReplicasReplicaUUIDChatCompletionsPostRequest | 
};
apiInstance.v1ReplicasReplicaUUIDChatCompletionsPost(replicaUUID, opts, (error, data, response) => {
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
 **xAPIVersion** | **String**|  | [optional] [default to &#39;2025-03-25&#39;]
 **v1ReplicasReplicaUUIDChatCompletionsPostRequest** | [**V1ReplicasReplicaUUIDChatCompletionsPostRequest**](V1ReplicasReplicaUUIDChatCompletionsPostRequest.md)|  | [optional] 

### Return type

[**V1ReplicasReplicaUUIDChatCompletionsPost200Response**](V1ReplicasReplicaUUIDChatCompletionsPost200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken), [UserID](../README.md#UserID)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/event-stream

