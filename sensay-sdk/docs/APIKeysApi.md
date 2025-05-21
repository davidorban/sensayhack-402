# SensayApi.APIKeysApi

All URIs are relative to *https://api.sensay.io*

Method | HTTP request | Description
------------- | ------------- | -------------
[**v1ApiKeysInvitesCodeRedeemPost**](APIKeysApi.md#v1ApiKeysInvitesCodeRedeemPost) | **POST** /v1/api-keys/invites/{code}/redeem | Redeem an API key invitation



## v1ApiKeysInvitesCodeRedeemPost

> V1ApiKeysInvitesCodeRedeemPost200Response v1ApiKeysInvitesCodeRedeemPost(code, opts)

Redeem an API key invitation

   If you have an invitation code, you can redeem it to create an Organization and an API key associated with it.   

### Example

```javascript
import SensayApi from 'sensay_api';

let apiInstance = new SensayApi.APIKeysApi();
let code = "code_example"; // String | 
let opts = {
  'v1ApiKeysInvitesCodeRedeemPostRequest': new SensayApi.V1ApiKeysInvitesCodeRedeemPostRequest() // V1ApiKeysInvitesCodeRedeemPostRequest | 
};
apiInstance.v1ApiKeysInvitesCodeRedeemPost(code, opts, (error, data, response) => {
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
 **code** | **String**|  | 
 **v1ApiKeysInvitesCodeRedeemPostRequest** | [**V1ApiKeysInvitesCodeRedeemPostRequest**](V1ApiKeysInvitesCodeRedeemPostRequest.md)|  | [optional] 

### Return type

[**V1ApiKeysInvitesCodeRedeemPost200Response**](V1ApiKeysInvitesCodeRedeemPost200Response.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

