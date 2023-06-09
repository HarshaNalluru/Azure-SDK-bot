import { AzureKeyCredential, ChatCompletions, ChatMessage, OpenAIClient } from "@azure/openai";
import { Message } from "./models";

export class AIClient {
    private readonly client: OpenAIClient;
    private readonly model: string;

    constructor($endpoint: string, $key: string, $model: string) {
        this.client = new OpenAIClient($endpoint, new AzureKeyCredential($key));
        this.model = $model;
    }

    async getSamples($conversation: Array<Message>): Promise<Message[]> {
        const prompts = new Array<ChatMessage>();
        for (let i = 0; i < $conversation.length; i++) {
            const m: Message = $conversation[i];

            prompts.push({
                role: m.sender === "bot" ? "bot" : "user",
                content: m.message
            });
        }

        const results = new Array<Message>();
        let completions: ChatCompletions;
        try {
            completions = await this.client.getChatCompletions(this.model, prompts, {
                maxTokens: 300,
                n: 10
            });
        } catch (error) {
            console.log(error);
            return results;
        }

        completions.choices.forEach((c) => {
            if (c.message === undefined) {
                console.log(`No response for ${c}`);
            } else {
                results.push({
                    message: c.message.content as string,
                    sender: c.message.role,
                });
            }
        });

        return results;
    }
}