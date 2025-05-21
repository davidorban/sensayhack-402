# SensayApi.V1TrainingGet200ResponseItemsInner

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **Number** | The unique identifier for this knowledge base entry. Use this ID in subsequent API calls to update or delete this entry. | 
**replicaUuid** | **String** | The unique identifier of the replica that owns this knowledge base entry. This links the training data to a specific replica. | 
**type** | **String** | The category of knowledge base entry, indicating how the content was added and how it should be processed. | 
**filename** | **String** | For file_upload entries, the original filename that was uploaded. This helps identify the source of the content. | 
**status** | **String** | The current stage in the processing pipeline. Use this to track progress and identify any issues with processing. | 
**rawText** | **String** | The original, unmodified text content that was submitted for training. May be truncated for large entries. | 
**processedText** | **String** | The optimized version of the text after system processing. This is what gets converted to vectors for retrieval. | 
**createdAt** | **Date** | ISO 8601 timestamp when this knowledge base entry was first created. | 
**updatedAt** | **Date** | ISO 8601 timestamp when this knowledge base entry was last modified. Use this to track when processing completed. | 
**title** | **String** | Optional title for this knowledge base entry. Helps identify the content in listings. | 
**description** | **String** | Optional description providing more details about this knowledge base entry. | 



## Enum: TypeEnum


* `file_upload` (value: `"file_upload"`)

* `url` (value: `"url"`)

* `training_history` (value: `"training_history"`)

* `text` (value: `"text"`)





## Enum: StatusEnum


* `AWAITING_UPLOAD` (value: `"AWAITING_UPLOAD"`)

* `SUPABASE_ONLY` (value: `"SUPABASE_ONLY"`)

* `PROCESSING` (value: `"PROCESSING"`)

* `READY` (value: `"READY"`)

* `SYNC_ERROR` (value: `"SYNC_ERROR"`)

* `ERR_FILE_PROCESSING` (value: `"ERR_FILE_PROCESSING"`)

* `ERR_TEXT_PROCESSING` (value: `"ERR_TEXT_PROCESSING"`)

* `ERR_TEXT_TO_VECTOR` (value: `"ERR_TEXT_TO_VECTOR"`)

* `BLANK` (value: `"BLANK"`)




