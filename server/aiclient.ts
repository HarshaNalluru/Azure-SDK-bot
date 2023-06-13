import { AzureOpenAIInput, ChatOpenAI } from "langchain/chat_models/openai";
import { AIChatMessage, BaseChatMessage, HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { Document } from "langchain/document";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { BufferMemory } from "langchain/memory";
import { Message } from "./models";
import path from "path";
import { DocumentLoader } from "langchain/dist/document_loaders/base";

export class AIClient {
    private readonly max_tokens: number = 2048;
    private readonly temperature: number = 0.9;

    private readonly client: ChatOpenAI;
    private readonly modelOrDeploymentName: string;
    private readonly vectorStore: Promise<HNSWLib>;
    private readonly documentLoader: DocumentLoader;

    private readonly azureAIInput: AzureOpenAIInput;
    private readonly chain: Promise<ConversationalRetrievalQAChain>;

    constructor($endpoint: string, $instance: string, $key: string, $model: string, $documentDirectory: string) {
        this.modelOrDeploymentName = $model;
        this.azureAIInput = {
            azureOpenAIApiKey: $key,
            azureOpenAIApiInstanceName: $instance,
            azureOpenAIApiDeploymentName: $model,
            azureOpenAIApiVersion: "2023-06-01-preview",
        };
        this.client = new ChatOpenAI(this.azureAIInput);
        this.documentLoader = new DirectoryLoader($documentDirectory, {
            ".md": (path) => new TextLoader(path),
            ".ts": (path) => new TextLoader(path),
            ".js": (path) => new TextLoader(path),
        });

        this.chain = this.initialize();
    }

    private async initialize(): Promise<ConversationalRetrievalQAChain> {
        let documents: Document<Record<string, any>>[];
        try {
            documents = await this.documentLoader.load();
        } catch (error) {
            console.log("Error loading documents.");
            console.log(error);
            return Promise.reject(error);
        }

        let vectorStore;
        try {
           vectorStore = await HNSWLib.fromDocuments(documents,
                new OpenAIEmbeddings(this.azureAIInput));
        } catch (error) {
            console.log("Error loading vector store.");
            console.log(error);
            return Promise.reject(error);
        }

        return ConversationalRetrievalQAChain.fromLLM(
            this.client,
            vectorStore.asRetriever(),
            {
                memory: new BufferMemory({
                    memoryKey: "chat_history", // Must be set to "chat_history"
                }),
            }
        );
    }

    async getSamples($inputConversation: Message[]): Promise<void> {
        const conversation: BaseChatMessage[] = [];

        for (let i = 0; i < $inputConversation.length; i++) {
            const m: Message = $inputConversation[i];
            switch (m.sender) {
                case "user":
                    conversation.push(new HumanChatMessage(m.message));
                    break;
                case "assistant":
                    // Incoming means that we sent a response some previous time in the conversation.
                    if (m.direction === "incoming") {
                        conversation.push(new AIChatMessage(m.message));
                    } else {
                        conversation.push(new SystemChatMessage(m.message));
                    }
                    break;
                case "system":
                    console.log("Adding system message: " + m);
                    conversation.push(new SystemChatMessage(m.message));
                    break;
                default:
                    console.log("Unknown role for sender: " + m.sender);
                    conversation.push(new SystemChatMessage(m.message));
                    break;
            }
        }

        const responses = await this.client.call(conversation);
        console.log(responses);
    }

    // async getSamples($conversation: Array<Message>): Promise<Message[]> {
    //     const prompts = new Array<ChatMessage>();
    //     for (let i = 0; i < $conversation.length; i++) {
    //         const m: Message = $conversation[i];

    //         prompts.push({
    //             role: m.sender === "assistant" ? "assistant" : "user",
    //             content: m.message
    //         });
    //     }

    //     const results = new Array<Message>();
    //     let completions: ChatCompletions;
    //     try {
    //         completions = await this.client.getChatCompletions(this.model, prompts, {
    //             maxTokens: 300,
    //             n: 10
    //         });
    //     } catch (error) {
    //         console.log(error);
    //         return results;
    //     }

    //     completions.choices.forEach((c) => {
    //         if (c.message === undefined) {
    //             console.log(`No response for ${c}`);
    //         } else {
    //             results.push({
    //                 message: c.message.content as string,
    //                 sender: c.message.role,
    //             });
    //         }
    //     });

    //     return results;
    // }
}