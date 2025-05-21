# SensayApi.UsersApi

All URIs are relative to *https://api.sensay.io*

Method | HTTP request | Description
------------- | ------------- | -------------
[**v1UsersMeDelete**](UsersApi.md#v1UsersMeDelete) | **DELETE** /v1/users/me | Delete the current user
[**v1UsersMeGet**](UsersApi.md#v1UsersMeGet) | **GET** /v1/users/me | Get the current user
[**v1UsersMePut**](UsersApi.md#v1UsersMePut) | **PUT** /v1/users/me | Update the current user
[**v1UsersPost**](UsersApi.md#v1UsersPost) | **POST** /v1/users | Create a user
[**v1UsersUserIDGet**](UsersApi.md#v1UsersUserIDGet) | **GET** /v1/users/{userID} | Get a user by ID



## v1UsersMeDelete

> v1UsersMeDelete(opts)

Delete the current user

This endpoint permanently deletes the currently authenticated user account, including all associated data. After deletion, the account cannot be recovered.

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

let apiInstance = new SensayApi.UsersApi();
let opts = {
  'xAPIVersion': "2025-03-25" // String | 
};
apiInstance.v1UsersMeDelete(opts, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully.');
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xAPIVersion** | **String**|  | [optional] [default to &#39;2025-03-25&#39;]

### Return type

null (empty response body)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken), [UserID](../README.md#UserID)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## v1UsersMeGet

> V1UsersMeGet200Response v1UsersMeGet(opts)

Get the current user

Returns information about the current user.

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

let apiInstance = new SensayApi.UsersApi();
let opts = {
  'xAPIVersion': "2025-03-25" // String | 
};
apiInstance.v1UsersMeGet(opts, (error, data, response) => {
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

### Return type

[**V1UsersMeGet200Response**](V1UsersMeGet200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken), [UserID](../README.md#UserID)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## v1UsersMePut

> V1UsersMeGet200Response v1UsersMePut(opts)

Update the current user

Update the currently logged in user.

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

let apiInstance = new SensayApi.UsersApi();
let opts = {
  'xAPIVersion': "2025-03-25", // String | 
  'v1UsersMeGet200Response': new SensayApi.V1UsersMeGet200Response() // V1UsersMeGet200Response | 
};
apiInstance.v1UsersMePut(opts, (error, data, response) => {
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
 **v1UsersMeGet200Response** | [**V1UsersMeGet200Response**](V1UsersMeGet200Response.md)|  | [optional] 

### Return type

[**V1UsersMeGet200Response**](V1UsersMeGet200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken), [UserID](../README.md#UserID)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## v1UsersPost

> V1UsersMeGet200Response v1UsersPost(opts)

Create a user

Creates a new user.

### Example

```javascript
import SensayApi from 'sensay_api';
let defaultClient = SensayApi.ApiClient.instance;
// Configure API key authorization: OrganizationServiceToken
let OrganizationServiceToken = defaultClient.authentications['OrganizationServiceToken'];
OrganizationServiceToken.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//OrganizationServiceToken.apiKeyPrefix = 'Token';

let apiInstance = new SensayApi.UsersApi();
let opts = {
  'xAPIVersion': "2025-03-25", // String | 
  'v1UsersPostRequest': new SensayApi.V1UsersPostRequest() // V1UsersPostRequest | 
};
apiInstance.v1UsersPost(opts, (error, data, response) => {
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
 **v1UsersPostRequest** | [**V1UsersPostRequest**](V1UsersPostRequest.md)|  | [optional] 

### Return type

[**V1UsersMeGet200Response**](V1UsersMeGet200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## v1UsersUserIDGet

> V1UsersMeGet200Response v1UsersUserIDGet(userID, opts)

Get a user by ID

Returns information about the user with the specified ID.

### Example

```javascript
import SensayApi from 'sensay_api';
let defaultClient = SensayApi.ApiClient.instance;
// Configure API key authorization: OrganizationServiceToken
let OrganizationServiceToken = defaultClient.authentications['OrganizationServiceToken'];
OrganizationServiceToken.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//OrganizationServiceToken.apiKeyPrefix = 'Token';

let apiInstance = new SensayApi.UsersApi();
let userID = "03db5651-cb61-4bdf-9ef0-89561f7c9c53"; // String | 
let opts = {
  'xAPIVersion': "2025-03-25" // String | 
};
apiInstance.v1UsersUserIDGet(userID, opts, (error, data, response) => {
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
 **userID** | **String**|  | 
 **xAPIVersion** | **String**|  | [optional] [default to &#39;2025-03-25&#39;]

### Return type

[**V1UsersMeGet200Response**](V1UsersMeGet200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

