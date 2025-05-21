# SensayApi.ReplicasApi

All URIs are relative to *https://api.sensay.io*

Method | HTTP request | Description
------------- | ------------- | -------------
[**v1ReplicasGet**](ReplicasApi.md#v1ReplicasGet) | **GET** /v1/replicas | List replicas
[**v1ReplicasPost**](ReplicasApi.md#v1ReplicasPost) | **POST** /v1/replicas | Create a replica
[**v1ReplicasReplicaUUIDDelete**](ReplicasApi.md#v1ReplicasReplicaUUIDDelete) | **DELETE** /v1/replicas/{replicaUUID} | Delete a replica
[**v1ReplicasReplicaUUIDGet**](ReplicasApi.md#v1ReplicasReplicaUUIDGet) | **GET** /v1/replicas/{replicaUUID} | Get a replica
[**v1ReplicasReplicaUUIDPut**](ReplicasApi.md#v1ReplicasReplicaUUIDPut) | **PUT** /v1/replicas/{replicaUUID} | Updates a replica



## v1ReplicasGet

> V1ReplicasGet200Response v1ReplicasGet(opts)

List replicas

List replicas with pagination with optional filtering. Only Replicas that are public or belong to the authenticated user are returned.

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

let apiInstance = new SensayApi.ReplicasApi();
let opts = {
  'ownerUuid': "ownerUuid_example", // String | Filters by the owner UUID of the Replicas
  'ownerID': "ownerID_example", // String | The replica owner ID.
  'pageIndex': 1, // Number | Pagination: The page index to return
  'pageSize': 24, // Number | Pagination: The number of items per page
  'slug': "slug_example", // String | Filters by the replica's slug
  'search': "search_example", // String | Search: by name of Replica, sorted in ascending order
  'tags': ["null"], // [String] | Filters by tags associated to Replicas
  'sort': "'name'", // String | Sorts by name or popularity of Replicas in ascending order
  'integration': "integration_example", // String | Filters by integration
  'xAPIVersion': "2025-03-25" // String | 
};
apiInstance.v1ReplicasGet(opts, (error, data, response) => {
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
 **ownerUuid** | **String**| Filters by the owner UUID of the Replicas | [optional] 
 **ownerID** | **String**| The replica owner ID. | [optional] 
 **pageIndex** | **Number**| Pagination: The page index to return | [optional] [default to 1]
 **pageSize** | **Number**| Pagination: The number of items per page | [optional] [default to 24]
 **slug** | **String**| Filters by the replica&#39;s slug | [optional] 
 **search** | **String**| Search: by name of Replica, sorted in ascending order | [optional] 
 **tags** | [**[String]**](String.md)| Filters by tags associated to Replicas | [optional] 
 **sort** | **String**| Sorts by name or popularity of Replicas in ascending order | [optional] [default to &#39;name&#39;]
 **integration** | **String**| Filters by integration | [optional] 
 **xAPIVersion** | **String**|  | [optional] [default to &#39;2025-03-25&#39;]

### Return type

[**V1ReplicasGet200Response**](V1ReplicasGet200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken), [UserID](../README.md#UserID)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## v1ReplicasPost

> V1ReplicasPost201Response v1ReplicasPost(opts)

Create a replica

Creates a new replica.

### Example

```javascript
import SensayApi from 'sensay_api';
let defaultClient = SensayApi.ApiClient.instance;
// Configure API key authorization: OrganizationServiceToken
let OrganizationServiceToken = defaultClient.authentications['OrganizationServiceToken'];
OrganizationServiceToken.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//OrganizationServiceToken.apiKeyPrefix = 'Token';

let apiInstance = new SensayApi.ReplicasApi();
let opts = {
  'xAPIVersion': "2025-03-25", // String | 
  'v1ReplicasPostRequest': new SensayApi.V1ReplicasPostRequest() // V1ReplicasPostRequest | 
};
apiInstance.v1ReplicasPost(opts, (error, data, response) => {
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
 **xAPIVersion** | **String**|  | [optional] [default to &#39;2025-03-25&#39;]
 **v1ReplicasPostRequest** | [**V1ReplicasPostRequest**](V1ReplicasPostRequest.md)|  | [optional] 

### Return type

[**V1ReplicasPost201Response**](V1ReplicasPost201Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## v1ReplicasReplicaUUIDDelete

> V1ReplicasReplicaUUIDDelete200Response v1ReplicasReplicaUUIDDelete(replicaUUID, opts)

Delete a replica

Deletes a replica by UUID.

### Example

```javascript
import SensayApi from 'sensay_api';
let defaultClient = SensayApi.ApiClient.instance;
// Configure API key authorization: OrganizationServiceToken
let OrganizationServiceToken = defaultClient.authentications['OrganizationServiceToken'];
OrganizationServiceToken.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//OrganizationServiceToken.apiKeyPrefix = 'Token';

let apiInstance = new SensayApi.ReplicasApi();
let replicaUUID = "replicaUUID_example"; // String | 
let opts = {
  'xAPIVersion': "2025-03-25" // String | 
};
apiInstance.v1ReplicasReplicaUUIDDelete(replicaUUID, opts, (error, data, response) => {
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

[**V1ReplicasReplicaUUIDDelete200Response**](V1ReplicasReplicaUUIDDelete200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## v1ReplicasReplicaUUIDGet

> V1ReplicasReplicaUUIDGet200Response v1ReplicasReplicaUUIDGet(replicaUUID, opts)

Get a replica

Get an existing replica.

### Example

```javascript
import SensayApi from 'sensay_api';
let defaultClient = SensayApi.ApiClient.instance;
// Configure API key authorization: OrganizationServiceToken
let OrganizationServiceToken = defaultClient.authentications['OrganizationServiceToken'];
OrganizationServiceToken.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//OrganizationServiceToken.apiKeyPrefix = 'Token';

let apiInstance = new SensayApi.ReplicasApi();
let replicaUUID = "replicaUUID_example"; // String | 
let opts = {
  'xAPIVersion': "2025-03-25" // String | 
};
apiInstance.v1ReplicasReplicaUUIDGet(replicaUUID, opts, (error, data, response) => {
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

[**V1ReplicasReplicaUUIDGet200Response**](V1ReplicasReplicaUUIDGet200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## v1ReplicasReplicaUUIDPut

> V1ReplicasReplicaUUIDPut200Response v1ReplicasReplicaUUIDPut(replicaUUID, opts)

Updates a replica

Updates an existing replica.

### Example

```javascript
import SensayApi from 'sensay_api';
let defaultClient = SensayApi.ApiClient.instance;
// Configure API key authorization: OrganizationServiceToken
let OrganizationServiceToken = defaultClient.authentications['OrganizationServiceToken'];
OrganizationServiceToken.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//OrganizationServiceToken.apiKeyPrefix = 'Token';

let apiInstance = new SensayApi.ReplicasApi();
let replicaUUID = "replicaUUID_example"; // String | 
let opts = {
  'xAPIVersion': "2025-03-25", // String | 
  'v1ReplicasPostRequest': new SensayApi.V1ReplicasPostRequest() // V1ReplicasPostRequest | 
};
apiInstance.v1ReplicasReplicaUUIDPut(replicaUUID, opts, (error, data, response) => {
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
 **v1ReplicasPostRequest** | [**V1ReplicasPostRequest**](V1ReplicasPostRequest.md)|  | [optional] 

### Return type

[**V1ReplicasReplicaUUIDPut200Response**](V1ReplicasReplicaUUIDPut200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

