# SensayApi.V1ReplicasReplicaUUIDGet200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **String** | The name of the replica. | 
**purpose** | **String** | The purpose of the replica. This field is not used for training the replica. | [optional] 
**shortDescription** | **String** | A short description of your replica. This field is not used for training the replica. | 
**greeting** | **String** | The first thing your replica will say when you start a conversation with them. | 
**type** | **String** | The replica type. &#x60;individual&#x60;: A replica of yourself. &#x60;character&#x60;: A replica of a character: can be anything you want. &#x60;brand&#x60;: A replica of a business persona or organization.  | [optional] [default to &#39;character&#39;]
**ownerID** | **String** | The replica owner ID. | 
**_private** | **Boolean** | Visibility of the replica. When set to &#x60;true&#x60;, only the owner will be able to find the replica and chat with it. | [optional] [default to false]
**whitelistEmails** | **[String]** | Emails of users who can use the replica. | [optional] 
**slug** | **String** | The slug of the replica. Slugs can be used by API consumers to determine the URLs where replicas can be found. | 
**tags** | **[String]** | The tags associated with the replica. Tags help categorize replicas and make them easier to find. | [optional] 
**profileImage** | **String** | The URL of the profile image of the replica. The image will be downloaded, optimized and stored on our servers, so the URL in the response will be different. Supported formats: .jpg, .jpeg, .png, .bmp, .webp, .avif | [optional] [default to &#39;https://sensay.io/assets/default-replica-profile.webp&#39;]
**suggestedQuestions** | **[String]** | Suggested questions when starting a conversation. | [optional] 
**llm** | [**V1ReplicasGet200ResponseItemsInnerLlm**](V1ReplicasGet200ResponseItemsInnerLlm.md) |  | 
**voicePreviewText** | **String** | Text that can be used to generate a voice preview. | [optional] 
**uuid** | **String** | The replica UUID | 



## Enum: TypeEnum


* `individual` (value: `"individual"`)

* `character` (value: `"character"`)

* `brand` (value: `"brand"`)




