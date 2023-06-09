import { ChatOpenAI } from "langchain/chat_models/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { BufferMemory } from "langchain/memory";

import * as fs from "fs";
import { config } from "dotenv";
config();

export const run = async () => {
    const text = fs.readFileSync("state_of_the_union.txt", "utf8");
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
    const docs = await textSplitter.createDocuments([text]);
    const secrets = {
        azureOpenAIApiKey: process.env["AZURE_OPENAI_API_KEY"],
        azureOpenAIApiInstanceName: process.env["AZURE_OPENAI_API_INSTANCE_NAME"],
        azureOpenAIApiDeploymentName: process.env["AZURE_OPENAI_API_DEPLOYMENT_NAME"],
        azureOpenAIApiVersion: "2023-05-15",
    };

    console.log("Vector store to be created");
    const vectorStore = await HNSWLib.fromDocuments(
        docs,
        new OpenAIEmbeddings({
            batchSize: 1
        })
    );
    console.log("Vector store created");
    const fasterModel = new ChatOpenAI({
        ...secrets,
        azureOpenAIApiDeploymentName: process.env["OPEN_AI_MODEL_3"],
        modelName: process.env["OPEN_AI_MODEL_3"], //"gpt-3.5-turbo",
    });
    const slowerModel = new ChatOpenAI({
        ...secrets,
        azureOpenAIApiDeploymentName: process.env["OPEN_AI_MODEL"],
        modelName: process.env["OPEN_AI_MODEL"], //"gpt-4",
    });
    const chain = ConversationalRetrievalQAChain.fromLLM(
        slowerModel,
        vectorStore.asRetriever(),
        {
            returnSourceDocuments: true,
            memory: new BufferMemory({
                memoryKey: "chat_history",
                inputKey: "question", // The key for the input to the chain
                outputKey: "text", // The key for the final conversational output of the chain
                returnMessages: true, // If using with a chat model
            }),
            questionGeneratorChainOptions: {
                llm: fasterModel,
            },
        }
    );

    /* Ask it a question */
    const question = "What did the president say about Justice Breyer?";
    const res = await chain.call({ question });
    console.log(res);

    const followUpRes = await chain.call({ question: "Was that nice?" });
    console.log(followUpRes);

};

run().catch(console.error);