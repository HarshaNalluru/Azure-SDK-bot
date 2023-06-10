// Import the required modules
import * as fs from 'fs';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as path from 'path';

// Define the input directory and the output directory
const inputDir: string = 'C:\\Users\\sanallur\\OneDrive - Microsoft\\Desktop\\WORK\\azure-sdk-for-js\\sdk';
const outputDir: string = './markdown-files';

// Create the output directory if it does not exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Define a function to get all markdown files in a directory and its subdirectories up to three levels deep and their parent directory names for two levels
async function getMarkdownFiles(dirPath: string): Promise<[string, string, string][]> {
    try {
        // Initialize an empty array to store the markdown file paths and their parent directory names
        const markdownFiles: [string, string, string][] = [];
        // Get the list of files in the directory
        const files = fs.readdirSync(dirPath);
        // Loop through each file
        for (const file of files) {
            // Get the full path of the file
            const filePath = path.join(dirPath, file);
            // Get the stats of the file
            const stats = fs.statSync(filePath);
            // If the file is a directory, get the list of files in the subdirectory and its subsubdirectory and add them to the array with their parent directory names if they are markdown files
            if (stats.isDirectory()) {
                const subFiles = fs.readdirSync(filePath);
                for (const subFile of subFiles) {
                    const subFilePath = path.join(filePath, subFile);
                    const subStats = fs.statSync(subFilePath);
                    if (subStats.isDirectory()) {
                        const subSubFiles = fs.readdirSync(subFilePath);
                        for (const subSubFile of subSubFiles) {
                            const subSubFilePath = path.join(subFilePath, subSubFile);
                            const subSubStats = fs.statSync(subSubFilePath);
                            if (subSubStats.isFile() && subSubFile.endsWith('.md') && !subSubFile.endsWith('CHANGELOG.md')) {
                                markdownFiles.push([subSubFilePath, file, subFile]);
                            }
                        }
                    } else if (subStats.isFile() && subFile.endsWith('.md') && !subFile.endsWith('CHANGELOG.md')) {
                        markdownFiles.push([subFilePath, file, '']);
                    }
                }
            }
            // If the file is a markdown file, add it to the array with an empty string as the parent directory name
            else if (file.endsWith('.md')) {
                markdownFiles.push([filePath, '', '']);
            }
        }
        // Return the array of markdown file paths and their parent directory names
        return markdownFiles;
    } catch (error) {
        // Log any error that occurs and return an empty array
        console.error(error);
        return [];
    }
}

async function getDocsFromMarkdownFiles(): Promise<unknown> {
    try {
        // Get the list of markdown files and their parent directory names in the input directory
        const markdownFiles = await getMarkdownFiles(inputDir);
        const megaText = [];
        const megaMetadata: { "service-folder": string, "sdk": string }[] = []
        // Loop through each markdown file and its parent directory names
        for (const [markdownFile, parentDir1, parentDir2] of markdownFiles) {
            // Create a new destination path by joining the output directory with the parent directory names and the markdown file name
            const destinationPath = path.join(outputDir, parentDir1 + "_" + parentDir2 + "_" + path.basename(markdownFile));
            // Create any intermediate directories if they do not exist
            fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
            // // Copy the markdown file to the new destination path
            // await copyFile(markdownFile, destinationPath);
            // console.log('Copied ' + markdownFile + ' to ' + destinationPath);
            const text = fs.readFileSync(markdownFile, "utf8");
            megaText.push(text);
            megaMetadata.push({ "service-folder": parentDir1, "sdk": parentDir2 });
        }
        const textSplitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", { chunkSize: 10000 });
        const docs = await textSplitter.createDocuments(megaText, megaMetadata);
        // Write text to a file using fs.writeFile
        fs.writeFile('markdown-content.json', JSON.stringify(docs), (err) => { });
        return docs;
    } catch (error) {
        // Log any error that occurs
        console.error(error);
    }
}

getDocsFromMarkdownFiles()