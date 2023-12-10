#!/usr/bin/env node
import simpleGit from 'simple-git';
import fs from "fs"

const localPath = "./";

// Check if the local repository exists
if (fs.existsSync(localPath)) {
    // If it exists, use the existing repository
    processData(localPath);
} else {
    console.error('Local repository does not exist.');
}

function processData(path) {
    simpleGit(path).log()
        .then(log => {
            const messages = log.all.map(commit => commit.message);

            // Write commit messages to a JSON file
            fs.writeFileSync('./public/commitMessages.json', JSON.stringify(messages, null, 2));
            console.log('Commit messages have been written to commitMessages.json');
        })
        .catch(err => console.error('Error in analyzing repository:', err));
}
