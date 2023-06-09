import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { config } from "dotenv";
config();

const run = async () => {

    const model = new ChatOpenAI({
        azureOpenAIApiVersion: '2023-06-01-preview',
        azureOpenAIApiKey: process.env["OPEN_API_KEY"],
        azureOpenAIApiInstanceName: process.env["OPEN_AI_INSTANCE"],
        azureOpenAIApiDeploymentName: process.env["OPEN_AI_MODEL"],
        temperature: 0,
    });

    const prompt = new PromptTemplate({
        template: 'What is the SPDX license for the following license text: {licenseText}',
        inputVariables: ['licenseText'],
    });

    const chain = new LLMChain({ llm: model, prompt });
    try {
        const res = await chain.call({

            licenseText: `

            typescript-eslint




                Originally extracted from:




                TypeScript ESLint Parser

                Copyright JS Foundation and other contributors, https://js.foundation




                Redistribution and use in source and binary forms, with or without

                modification, are permitted provided that the following conditions are met:




                - Redistributions of source code must retain the above copyright

                notice, this list of conditions and the following disclaimer.

                - Redistributions in binary form must reproduce the above copyright

                notice, this list of conditions and the following disclaimer in the

                documentation and/or other materials provided with the distribution.




                THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"

                AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE

                IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE

                ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY

                DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES

                (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;

                LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND

                ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT

                (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF

                THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

            `,

        });




        console.log(res);

    } catch (e) {

        console.error(e);

    }

};




run();
