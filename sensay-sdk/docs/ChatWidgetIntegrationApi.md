# SensayApi.ChatWidgetIntegrationApi

All URIs are relative to *https://api.sensay.io*

Method | HTTP request | Description
------------- | ------------- | -------------
[**v1ReplicasReplicaUUIDChatHistoryEmbedGet**](ChatWidgetIntegrationApi.md#v1ReplicasReplicaUUIDChatHistoryEmbedGet) | **GET** /v1/replicas/{replicaUUID}/chat/history/embed | Get Embed chat history



## v1ReplicasReplicaUUIDChatHistoryEmbedGet

> V1ReplicasReplicaUUIDChatHistoryGet200Response v1ReplicasReplicaUUIDChatHistoryEmbedGet(replicaUUID)

Get Embed chat history

List embed chat history items of a Replica belonging to the logged in user.

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

let apiInstance = new SensayApi.ChatWidgetIntegrationApi();
let replicaUUID = "replicaUUID_example"; // String | 
apiInstance.v1ReplicasReplicaUUIDChatHistoryEmbedGet(replicaUUID, (error, data, response) => {
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

