// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import express from "express";
import cors from "cors";

const app = express();
const port = 8080;
const TEST_SERVER_URL = `http://localhost:${port}`;
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

app.listen(port, () => {
    console.log(`server started at ${TEST_SERVER_URL}`);
});