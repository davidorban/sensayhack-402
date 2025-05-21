# SensayApi.ChatHistoryApi

All URIs are relative to *https://api.sensay.io*

Method | HTTP request | Description
------------- | ------------- | -------------
[**v1ReplicasReplicaUUIDChatHistoryGet**](ChatHistoryApi.md#v1ReplicasReplicaUUIDChatHistoryGet) | **GET** /v1/replicas/{replicaUUID}/chat/history | Get chat history
[**v1ReplicasReplicaUUIDChatHistoryPost**](ChatHistoryApi.md#v1ReplicasReplicaUUIDChatHistoryPost) | **POST** /v1/replicas/{replicaUUID}/chat/history | Create a chat history entry
[**v1ReplicasReplicaUUIDChatHistoryWebGet**](ChatHistoryApi.md#v1ReplicasReplicaUUIDChatHistoryWebGet) | **GET** /v1/replicas/{replicaUUID}/chat/history/web | Get Web chat history



## v1ReplicasReplicaUUIDChatHistoryGet

> V1ReplicasReplicaUUIDChatHistoryGet200Response v1ReplicasReplicaUUIDChatHistoryGet(replicaUUID, opts)

Get chat history

List chat history items of a Replica belonging to the logged in user.

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

let apiInstance = new SensayApi.ChatHistoryApi();
let replicaUUID = "replicaUUID_example"; // String | 
let opts = {
  'xAPIVersion': "2025-03-25" // String | 
};
apiInstance.v1ReplicasReplicaUUIDChatHistoryGet(replicaUUID, opts, (error, data, response) => {
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

[**V1ReplicasReplicaUUIDChatHistoryGet200Response**](V1ReplicasReplicaUUIDChatHistoryGet200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken), [UserID](../README.md#UserID)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## v1ReplicasReplicaUUIDChatHistoryPost

> V1ReplicasReplicaUUIDTrainingTrainingIDPut200Response v1ReplicasReplicaUUIDChatHistoryPost(replicaUUID, opts)

Create a chat history entry

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

let apiInstance = new SensayApi.ChatHistoryApi();
let replicaUUID = "replicaUUID_example"; // String | 
let opts = {
  'xAPIVersion': "2025-03-25", // String | 
  'v1ReplicasReplicaUUIDChatHistoryPostRequest': new SensayApi.V1ReplicasReplicaUUIDChatHistoryPostRequest() // V1ReplicasReplicaUUIDChatHistoryPostRequest | 
};
apiInstance.v1ReplicasReplicaUUIDChatHistoryPost(replicaUUID, opts, (error, data, response) => {
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
 **v1ReplicasReplicaUUIDChatHistoryPostRequest** | [**V1ReplicasReplicaUUIDChatHistoryPostRequest**](V1ReplicasReplicaUUIDChatHistoryPostRequest.md)|  | [optional] 

### Return type

[**V1ReplicasReplicaUUIDTrainingTrainingIDPut200Response**](V1ReplicasReplicaUUIDTrainingTrainingIDPut200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken), [UserID](../README.md#UserID)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## v1ReplicasReplicaUUIDChatHistoryWebGet

> V1ReplicasReplicaUUIDChatHistoryGet200Response v1ReplicasReplicaUUIDChatHistoryWebGet(replicaUUID)

Get Web chat history

List web chat history items of a Replica belonging to the logged in user.

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

let apiInstance = new SensayApi.ChatHistoryApi();
let replicaUUID = "replicaUUID_example"; // String | 
apiInstance.v1ReplicasReplicaUUIDChatHistoryWebGet(replicaUUID, (error, data, response) => {
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

