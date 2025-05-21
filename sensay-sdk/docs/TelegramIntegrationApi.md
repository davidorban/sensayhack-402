# SensayApi.TelegramIntegrationApi

All URIs are relative to *https://api.sensay.io*

Method | HTTP request | Description
------------- | ------------- | -------------
[**v1ReplicasReplicaUUIDChatCompletionsTelegramPost**](TelegramIntegrationApi.md#v1ReplicasReplicaUUIDChatCompletionsTelegramPost) | **POST** /v1/replicas/{replicaUUID}/chat/completions/telegram | Generate a Telegram completion
[**v1ReplicasReplicaUUIDChatHistoryTelegramGet**](TelegramIntegrationApi.md#v1ReplicasReplicaUUIDChatHistoryTelegramGet) | **GET** /v1/replicas/{replicaUUID}/chat/history/telegram | Get Telegram chat history
[**v1ReplicasReplicaUUIDChatHistoryTelegramPost**](TelegramIntegrationApi.md#v1ReplicasReplicaUUIDChatHistoryTelegramPost) | **POST** /v1/replicas/{replicaUUID}/chat/history/telegram | Create a Telegram chat history entry
[**v1ReplicasReplicaUUIDIntegrationsTelegramDelete**](TelegramIntegrationApi.md#v1ReplicasReplicaUUIDIntegrationsTelegramDelete) | **DELETE** /v1/replicas/{replicaUUID}/integrations/telegram | Delete a replica Telegram integration
[**v1ReplicasReplicaUUIDIntegrationsTelegramPost**](TelegramIntegrationApi.md#v1ReplicasReplicaUUIDIntegrationsTelegramPost) | **POST** /v1/replicas/{replicaUUID}/integrations/telegram | Create a replica Telegram integration



## v1ReplicasReplicaUUIDChatCompletionsTelegramPost

> V1ReplicasReplicaUUIDChatCompletionsPost200Response v1ReplicasReplicaUUIDChatCompletionsTelegramPost(replicaUUID, opts)

Generate a Telegram completion

     Ask for a completion and stores the prompt in the chat history.        Replica chat supports two response formats: streamed and JSON. To switch between these formats, use the &#39;Accept&#39; header, specifying either &#39;text/event-stream&#39; for streaming or &#39;application/json&#39; for JSON.     The streamed response honours the [Stream Protocol](https://sdk.vercel.ai/docs/ai-sdk-ui/stream-protocol), allowing the use of a number of SDKs, including [Vercel AI SDK](https://sdk.vercel.ai/docs/introduction).        The streamed variant is not specified in the OpenAPI Schema because it is not an OpenAPI endpoint.     

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

let apiInstance = new SensayApi.TelegramIntegrationApi();
let replicaUUID = "replicaUUID_example"; // String | 
let opts = {
  'v1ReplicasReplicaUUIDChatCompletionsTelegramPostRequest': new SensayApi.V1ReplicasReplicaUUIDChatCompletionsTelegramPostRequest() // V1ReplicasReplicaUUIDChatCompletionsTelegramPostRequest | 
};
apiInstance.v1ReplicasReplicaUUIDChatCompletionsTelegramPost(replicaUUID, opts, (error, data, response) => {
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
 **v1ReplicasReplicaUUIDChatCompletionsTelegramPostRequest** | [**V1ReplicasReplicaUUIDChatCompletionsTelegramPostRequest**](V1ReplicasReplicaUUIDChatCompletionsTelegramPostRequest.md)|  | [optional] 

### Return type

[**V1ReplicasReplicaUUIDChatCompletionsPost200Response**](V1ReplicasReplicaUUIDChatCompletionsPost200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken), [UserID](../README.md#UserID)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json, text/event-stream


## v1ReplicasReplicaUUIDChatHistoryTelegramGet

> V1ReplicasReplicaUUIDChatHistoryGet200Response v1ReplicasReplicaUUIDChatHistoryTelegramGet(replicaUUID)

Get Telegram chat history

List telegram chat history items of a Replica belonging to the logged in user.

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

let apiInstance = new SensayApi.TelegramIntegrationApi();
let replicaUUID = "replicaUUID_example"; // String | 
apiInstance.v1ReplicasReplicaUUIDChatHistoryTelegramGet(replicaUUID, (error, data, response) => {
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

### Return type

[**V1ReplicasReplicaUUIDChatHistoryGet200Response**](V1ReplicasReplicaUUIDChatHistoryGet200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken), [UserID](../README.md#UserID)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## v1ReplicasReplicaUUIDChatHistoryTelegramPost

> V1ReplicasReplicaUUIDTrainingTrainingIDPut200Response v1ReplicasReplicaUUIDChatHistoryTelegramPost(replicaUUID, opts)

Create a Telegram chat history entry

Save chat history items of a Replica belonging to the logged in user.

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

let apiInstance = new SensayApi.TelegramIntegrationApi();
let replicaUUID = "replicaUUID_example"; // String | 
let opts = {
  'v1ReplicasReplicaUUIDChatHistoryTelegramPostRequest': new SensayApi.V1ReplicasReplicaUUIDChatHistoryTelegramPostRequest() // V1ReplicasReplicaUUIDChatHistoryTelegramPostRequest | 
};
apiInstance.v1ReplicasReplicaUUIDChatHistoryTelegramPost(replicaUUID, opts, (error, data, response) => {
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
 **v1ReplicasReplicaUUIDChatHistoryTelegramPostRequest** | [**V1ReplicasReplicaUUIDChatHistoryTelegramPostRequest**](V1ReplicasReplicaUUIDChatHistoryTelegramPostRequest.md)|  | [optional] 

### Return type

[**V1ReplicasReplicaUUIDTrainingTrainingIDPut200Response**](V1ReplicasReplicaUUIDTrainingTrainingIDPut200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken), [UserID](../README.md#UserID)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## v1ReplicasReplicaUUIDIntegrationsTelegramDelete

> V1ReplicasReplicaUUIDTrainingTrainingIDPut200Response v1ReplicasReplicaUUIDIntegrationsTelegramDelete(replicaUUID, opts)

Delete a replica Telegram integration

Removes a replica Telegram integration.

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

let apiInstance = new SensayApi.TelegramIntegrationApi();
let replicaUUID = "replicaUUID_example"; // String | 
let opts = {
  'xAPIVersion': "2025-03-25" // String | 
};
apiInstance.v1ReplicasReplicaUUIDIntegrationsTelegramDelete(replicaUUID, opts, (error, data, response) => {
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

### Return type

[**V1ReplicasReplicaUUIDTrainingTrainingIDPut200Response**](V1ReplicasReplicaUUIDTrainingTrainingIDPut200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken), [UserID](../README.md#UserID)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## v1ReplicasReplicaUUIDIntegrationsTelegramPost

> V1ReplicasReplicaUUIDIntegrationsTelegramPost200Response v1ReplicasReplicaUUIDIntegrationsTelegramPost(replicaUUID, opts)

Create a replica Telegram integration

Integrates a replica to Telegram. The default Sensay Telegram integration will run a bot for you until you delete the integration.

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

let apiInstance = new SensayApi.TelegramIntegrationApi();
let replicaUUID = "replicaUUID_example"; // String | 
let opts = {
  'xAPIVersion': "2025-03-25", // String | 
  'v1ReplicasReplicaUUIDIntegrationsTelegramPostRequest': new SensayApi.V1ReplicasReplicaUUIDIntegrationsTelegramPostRequest() // V1ReplicasReplicaUUIDIntegrationsTelegramPostRequest | 
};
apiInstance.v1ReplicasReplicaUUIDIntegrationsTelegramPost(replicaUUID, opts, (error, data, response) => {
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
 **v1ReplicasReplicaUUIDIntegrationsTelegramPostRequest** | [**V1ReplicasReplicaUUIDIntegrationsTelegramPostRequest**](V1ReplicasReplicaUUIDIntegrationsTelegramPostRequest.md)|  | [optional] 

### Return type

[**V1ReplicasReplicaUUIDIntegrationsTelegramPost200Response**](V1ReplicasReplicaUUIDIntegrationsTelegramPost200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken), [UserID](../README.md#UserID)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

