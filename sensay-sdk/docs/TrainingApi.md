# SensayApi.TrainingApi

All URIs are relative to *https://api.sensay.io*

Method | HTTP request | Description
------------- | ------------- | -------------
[**v1ReplicasReplicaUUIDTrainingFilesUploadGet**](TrainingApi.md#v1ReplicasReplicaUUIDTrainingFilesUploadGet) | **GET** /v1/replicas/{replicaUUID}/training/files/upload | Generate a signed URL for file upload
[**v1ReplicasReplicaUUIDTrainingPost**](TrainingApi.md#v1ReplicasReplicaUUIDTrainingPost) | **POST** /v1/replicas/{replicaUUID}/training | Create a knowledge base entry
[**v1ReplicasReplicaUUIDTrainingTrainingIDPut**](TrainingApi.md#v1ReplicasReplicaUUIDTrainingTrainingIDPut) | **PUT** /v1/replicas/{replicaUUID}/training/{trainingID} | Update knowledge base entry
[**v1TrainingGet**](TrainingApi.md#v1TrainingGet) | **GET** /v1/training | List all knowledge base entries
[**v1TrainingTrainingIDDelete**](TrainingApi.md#v1TrainingTrainingIDDelete) | **DELETE** /v1/training/{trainingID} | Delete knowledge base entry by ID
[**v1TrainingTrainingIDGet**](TrainingApi.md#v1TrainingTrainingIDGet) | **GET** /v1/training/{trainingID} | Get knowledge base entry by ID



## v1ReplicasReplicaUUIDTrainingFilesUploadGet

> V1ReplicasReplicaUUIDTrainingFilesUploadGet200Response v1ReplicasReplicaUUIDTrainingFilesUploadGet(replicaUUID, filename)

Generate a signed URL for file upload

Creates a signed URL for uploading a file to the knowledge base. This is the first step in the file-based training process. The response includes both a signedURL where you can upload your file and a knowledgeBaseID for tracking. After receiving these, use a PUT request to the signedURL to upload your file (with Content-Type: application/octet-stream). The system will automatically extract text from your file, process it, and make it available for your replica to use. Supported file types include PDF, DOCX, and other text-based formats. Files up to 50MB are supported.

### Example

```javascript
import SensayApi from 'sensay_api';
let defaultClient = SensayApi.ApiClient.instance;
// Configure API key authorization: OrganizationServiceToken
let OrganizationServiceToken = defaultClient.authentications['OrganizationServiceToken'];
OrganizationServiceToken.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//OrganizationServiceToken.apiKeyPrefix = 'Token';

let apiInstance = new SensayApi.TrainingApi();
let replicaUUID = "replicaUUID_example"; // String | 
let filename = "company_handbook.pdf"; // String | The name of the file you want to upload to the knowledge base. This helps identify the file in your knowledge base. Files up to 50MB are supported.
apiInstance.v1ReplicasReplicaUUIDTrainingFilesUploadGet(replicaUUID, filename, (error, data, response) => {
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
 **filename** | **String**| The name of the file you want to upload to the knowledge base. This helps identify the file in your knowledge base. Files up to 50MB are supported. | 

### Return type

[**V1ReplicasReplicaUUIDTrainingFilesUploadGet200Response**](V1ReplicasReplicaUUIDTrainingFilesUploadGet200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## v1ReplicasReplicaUUIDTrainingPost

> V1ReplicasReplicaUUIDTrainingPost200Response v1ReplicasReplicaUUIDTrainingPost(replicaUUID, opts)

Create a knowledge base entry

Creates a new empty knowledge base entry for a replica. This is the first step in the text-based training process. After creating the entry, you&#39;ll receive a knowledgeBaseID that you&#39;ll need to use in the next step to add your training content using the Update endpoint. The entry starts with a BLANK status and will be processed automatically once you add content.

### Example

```javascript
import SensayApi from 'sensay_api';
let defaultClient = SensayApi.ApiClient.instance;
// Configure API key authorization: OrganizationServiceToken
let OrganizationServiceToken = defaultClient.authentications['OrganizationServiceToken'];
OrganizationServiceToken.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//OrganizationServiceToken.apiKeyPrefix = 'Token';

let apiInstance = new SensayApi.TrainingApi();
let replicaUUID = "replicaUUID_example"; // String | 
let opts = {
  'xAPIVersion': "2025-03-25" // String | 
};
apiInstance.v1ReplicasReplicaUUIDTrainingPost(replicaUUID, opts, (error, data, response) => {
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

[**V1ReplicasReplicaUUIDTrainingPost200Response**](V1ReplicasReplicaUUIDTrainingPost200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## v1ReplicasReplicaUUIDTrainingTrainingIDPut

> V1ReplicasReplicaUUIDTrainingTrainingIDPut200Response v1ReplicasReplicaUUIDTrainingTrainingIDPut(replicaUUID, opts)

Update knowledge base entry

Updates a knowledge base entry with training content. This is the second step in the training process after creating an entry. You can provide \&quot;rawText\&quot; which is the content you want your replica to learn from (such as product information, company policies, or specialized knowledge). The system will automatically process this text and make it available for your replica to use when answering questions. The entry status will change to PROCESSING and then to READY once fully processed.

### Example

```javascript
import SensayApi from 'sensay_api';
let defaultClient = SensayApi.ApiClient.instance;
// Configure API key authorization: OrganizationServiceToken
let OrganizationServiceToken = defaultClient.authentications['OrganizationServiceToken'];
OrganizationServiceToken.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//OrganizationServiceToken.apiKeyPrefix = 'Token';

let apiInstance = new SensayApi.TrainingApi();
let replicaUUID = "replicaUUID_example"; // String | 
let opts = {
  'trainingID': 3.4, // Number | 
  'v1ReplicasReplicaUUIDTrainingTrainingIDPutRequest': new SensayApi.V1ReplicasReplicaUUIDTrainingTrainingIDPutRequest() // V1ReplicasReplicaUUIDTrainingTrainingIDPutRequest | 
};
apiInstance.v1ReplicasReplicaUUIDTrainingTrainingIDPut(replicaUUID, opts, (error, data, response) => {
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
 **trainingID** | **Number**|  | [optional] 
 **v1ReplicasReplicaUUIDTrainingTrainingIDPutRequest** | [**V1ReplicasReplicaUUIDTrainingTrainingIDPutRequest**](V1ReplicasReplicaUUIDTrainingTrainingIDPutRequest.md)|  | [optional] 

### Return type

[**V1ReplicasReplicaUUIDTrainingTrainingIDPut200Response**](V1ReplicasReplicaUUIDTrainingTrainingIDPut200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## v1TrainingGet

> V1TrainingGet200Response v1TrainingGet(opts)

List all knowledge base entries

Returns a list of all knowledge base entries belonging to your organization. This endpoint allows you to view all your training data in one place, with optional filtering by status or type. You can use this to monitor the overall state of your knowledge base, check which entries are still processing, and identify any that might have encountered errors. The response includes detailed information about each entry including its content, status, and metadata.

### Example

```javascript
import SensayApi from 'sensay_api';
let defaultClient = SensayApi.ApiClient.instance;
// Configure API key authorization: OrganizationServiceToken
let OrganizationServiceToken = defaultClient.authentications['OrganizationServiceToken'];
OrganizationServiceToken.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//OrganizationServiceToken.apiKeyPrefix = 'Token';

let apiInstance = new SensayApi.TrainingApi();
let opts = {
  'status': "READY", // String | Filter to show only knowledge base entries with a specific processing status (e.g., READY, PROCESSING, ERR_FILE_PROCESSING)
  'type': "file_upload", // String | Filter to show only knowledge base entries of a specific type (e.g., text, file_upload, url, training_history)
  'page': "1", // String | The page number for paginated results (starts at 1). Use this to navigate through large result sets.
  'limit': "50", // String | The maximum number of knowledge base entries to return per page (up to 100). Use this to control result set size.
  'xAPIVersion': "2025-03-25" // String | 
};
apiInstance.v1TrainingGet(opts, (error, data, response) => {
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
 **status** | **String**| Filter to show only knowledge base entries with a specific processing status (e.g., READY, PROCESSING, ERR_FILE_PROCESSING) | [optional] 
 **type** | **String**| Filter to show only knowledge base entries of a specific type (e.g., text, file_upload, url, training_history) | [optional] 
 **page** | **String**| The page number for paginated results (starts at 1). Use this to navigate through large result sets. | [optional] [default to &#39;1&#39;]
 **limit** | **String**| The maximum number of knowledge base entries to return per page (up to 100). Use this to control result set size. | [optional] [default to &#39;100&#39;]
 **xAPIVersion** | **String**|  | [optional] [default to &#39;2025-03-25&#39;]

### Return type

[**V1TrainingGet200Response**](V1TrainingGet200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## v1TrainingTrainingIDDelete

> V1TrainingTrainingIDDelete200Response v1TrainingTrainingIDDelete(opts)

Delete knowledge base entry by ID

Permanently removes a specific knowledge base entry and its associated vector database entry. Use this endpoint when you need to remove outdated or incorrect training data from your replica&#39;s knowledge base. This operation cannot be undone, and the entry will no longer be available for retrieval during conversations with your replica. This endpoint handles the complete cleanup process, removing both the database record and any associated vector embeddings.

### Example

```javascript
import SensayApi from 'sensay_api';
let defaultClient = SensayApi.ApiClient.instance;
// Configure API key authorization: OrganizationServiceToken
let OrganizationServiceToken = defaultClient.authentications['OrganizationServiceToken'];
OrganizationServiceToken.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//OrganizationServiceToken.apiKeyPrefix = 'Token';

let apiInstance = new SensayApi.TrainingApi();
let opts = {
  'trainingID': 12345, // Number | 
  'xAPIVersion': "2025-03-25" // String | 
};
apiInstance.v1TrainingTrainingIDDelete(opts, (error, data, response) => {
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
 **trainingID** | **Number**|  | [optional] 
 **xAPIVersion** | **String**|  | [optional] [default to &#39;2025-03-25&#39;]

### Return type

[**V1TrainingTrainingIDDelete200Response**](V1TrainingTrainingIDDelete200Response.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## v1TrainingTrainingIDGet

> V1TrainingGet200ResponseItemsInner v1TrainingTrainingIDGet(opts)

Get knowledge base entry by ID

Retrieves detailed information about a specific knowledge base entry using its ID. This endpoint returns the complete entry data including its type, status, content, and metadata. You can use this to check the processing status of your training content, view the raw and processed text, and see when it was created and last updated. This is useful for monitoring the progress of your training data as it moves through the processing pipeline.

### Example

```javascript
import SensayApi from 'sensay_api';
let defaultClient = SensayApi.ApiClient.instance;
// Configure API key authorization: OrganizationServiceToken
let OrganizationServiceToken = defaultClient.authentications['OrganizationServiceToken'];
OrganizationServiceToken.apiKey = 'YOUR API KEY';
// Uncomment the following line to set a prefix for the API key, e.g. "Token" (defaults to null)
//OrganizationServiceToken.apiKeyPrefix = 'Token';

let apiInstance = new SensayApi.TrainingApi();
let opts = {
  'trainingID': 12345, // Number | 
  'xAPIVersion': "2025-03-25" // String | 
};
apiInstance.v1TrainingTrainingIDGet(opts, (error, data, response) => {
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
 **trainingID** | **Number**|  | [optional] 
 **xAPIVersion** | **String**|  | [optional] [default to &#39;2025-03-25&#39;]

### Return type

[**V1TrainingGet200ResponseItemsInner**](V1TrainingGet200ResponseItemsInner.md)

### Authorization

[OrganizationServiceToken](../README.md#OrganizationServiceToken)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

