# SensayApi.V1ReplicasGet200ResponseItemsInnerLlm

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**model** | **String** | The LLM model of the replica. | [optional] [default to &#39;claude-3-5-haiku-latest&#39;]
**memoryMode** | **String** | The memory mode of the replica. | [optional] [default to &#39;rag-search&#39;]
**systemMessage** | **String** | Who is your replica? How do you want it to talk, respond and act. | [optional] 
**tools** | **[String]** | The replica&#39;s tools. Tools enable agents to interact with the world. &#x60;getTokenInfo&#x60;: Allows replica to get token information  | [optional] 



## Enum: ModelEnum


* `gpt-4o` (value: `"gpt-4o"`)

* `claude-3-5-haiku-latest` (value: `"claude-3-5-haiku-latest"`)

* `claude-3-7-sonnet-latest` (value: `"claude-3-7-sonnet-latest"`)

* `grok-2-latest` (value: `"grok-2-latest"`)

* `grok-3-beta` (value: `"grok-3-beta"`)

* `deepseek-chat` (value: `"deepseek-chat"`)

* `o3-mini` (value: `"o3-mini"`)

* `gpt-4o-mini` (value: `"gpt-4o-mini"`)

* `huggingface-eva` (value: `"huggingface-eva"`)

* `huggingface-dolphin-llama` (value: `"huggingface-dolphin-llama"`)





## Enum: MemoryModeEnum


* `prompt-caching` (value: `"prompt-caching"`)

* `rag-search` (value: `"rag-search"`)





## Enum: [ToolsEnum]


* `getTokenInfo` (value: `"getTokenInfo"`)

* `getUdaoTokenInfo` (value: `"getUdaoTokenInfo"`)

* `getSensayTokenInfo` (value: `"getSensayTokenInfo"`)

* `getTokenInfoMEAI` (value: `"getTokenInfoMEAI"`)

* `answerToLife` (value: `"answerToLife"`)

* `toolhouse` (value: `"toolhouse"`)




