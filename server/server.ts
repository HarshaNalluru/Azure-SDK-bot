// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import 'dotenv/config';
import express from "express";
import cors from "cors";
import { AIClient } from "./aiclient";
import { Message } from './models';

const app = express();
const port = 8080;
const TEST_SERVER_URL = `http://localhost:${port}`;

const endpoint: string = process.env.OPEN_API_ENDPOINT != null ? process.env.OPEN_API_ENDPOINT : "";
const key : string = process.env.OPEN_API_KEY != null ? process.env.OPEN_API_KEY : "";
const model: string = process.env.OPEN_AI_MODEL != null ? process.env.OPEN_AI_MODEL : "text-davinci-003";

const client = new AIClient(endpoint, key, model);

// app.use(express.json());
app.use(express.text());
app.set("etag", false); // turn off
app.use(cors());

app.get("/", (_, res) => {
    res.send("Hello world!");
});

app.post("/sample_response", (req, res) => {
    console.log(req.body);
    res.send({ val: `abc-${Math.ceil(Math.random() * 10000)}` });
    console.log("response sent");
});

app.post("/question", async (req, res) => {
    console.log(req.body);

    const conversation: Array<Message> = JSON.parse(req.body);

    console.log(`conversation length: ${conversation.length}`);
    const samples = await client.getSamples(conversation);
    res.send({ samples });
    console.log("response sent");
});

app.listen(port, () => {
    console.log(`server started at ${TEST_SERVER_URL}`);
});