import { readFile, writeFile, readdir, stat, mkdir, access } from "fs/promises"
import path from 'path';
import inquirer from "inquirer";


function removeLettersInStrAfterPeriod(inputString) {
    // Find the position of the period
    var periodIndex = inputString.indexOf('.');

    // If the period is found, remove it and all characters that follow
    if (periodIndex !== -1) {
        var resultString = inputString.substring(0, periodIndex);
        return resultString;
    }

    // If no period is found, return the original string
    console.log(inputString);
    return inputString;
}

function createWebExportFile(data, path, name) {
    data = data.replace(/`/g, '\\`');
    data = data.replace(/\${/g, '\\${');
    writeFile(`${path}`,
        `export default function ${name} (){
        return \`${data}\`
    }`, function (err) {
        return err ? `Error Creating webExport File for ${path} ${err}` : console.log(`Web Export File for ${path} Has Been Saved`);
    })
}

function createComponentLazyLoadIndexFile(path, filesArr) {
    writeFile(`${path}/rootIndex.js`,
        `export default () => {
        return \`
            import { lazy } from 'react'
            ${filesArr.map(fileName => `export const ${removeLettersInStrAfterPeriod(fileName)} = lazy( ()=> import('./${removeLettersInStrAfterPeriod(fileName)}'))\n\t\t`).join(' ')}
        \`
    }`, function (err) {
        return err ? `Error Creating createComponentLazyLoadIndexFile File for ${path} ${err}` : console.log(`createComponentLazyLoadIndexFile File for ${path} Has Been Saved`);
    })

}

async function createDirIfNotExist(path) {
    try {
        await access(path);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Directory doesn't exist, so create it
            await mkdir(path, { recursive: true });
        } else {
            // Some other error occurred
            throw error;
        }
    }
}

async function handleV2DirFilesExport(sourcePath, destinationPath) {
    const subFolderFiles = await readdir(sourcePath);
    await mkdir(destinationPath, { recursive: true });
    console.log(`files in ${sourcePath}:`, subFolderFiles)
    createComponentLazyLoadIndexFile(destinationPath, subFolderFiles)
    subFolderFiles.forEach(async (subFile) => {
        let newSourcePath = path.join(sourcePath, subFile);
        let newDestinationPath = path.join(destinationPath, subFile);
        const newSourcePathStats = await stat(newSourcePath);
        if (newSourcePathStats.isDirectory()) {
            handleV2DirFilesExport(newSourcePath, newDestinationPath)
        } else if (newSourcePathStats.isFile()) {
            const data = await readFile(newSourcePath, { encoding: 'utf8' });
            if (subFile === "index.js") {
                await writeFile(newDestinationPath,
                    `export {default as rootIndex} from "./rootIndex"\n ${data}`)
            } else {
                createWebExportFile(data, newDestinationPath, removeLettersInStrAfterPeriod(subFile))
            }
        }
    })
}

async function getUserPrompts() {
    try {
        const answers = await inquirer.prompt([
            {
                message: "Name of Component folder(Case Sensitive)",
                name: "sourceDir",
            },
            {
                message: "Name of Folder to Export Component (Would Be Created If Non-Existent)",
                name: "exportDir",
            },
        ])
        return answers
    } catch (error) {
        if (error.isTtyError) {
            // Prompt couldn't be rendered in the current environment
        } else {
            // Something else went wrong
        }
        console.log("Error from user prompts: ", error)
    }
}


(async () => {
    const userPrompt = await getUserPrompts()
    const directoryPath = `components/${userPrompt?.sourceDir}`;
    const directoryDestinationPath = `webExport/${userPrompt?.exportDir}/${userPrompt?.sourceDir}`;
    try {
        const files = await readdir(directoryPath)
        console.log('Files in the components directory:', files);
        await createDirIfNotExist(directoryDestinationPath)
        createComponentLazyLoadIndexFile(directoryDestinationPath, files.filter(item => item != 'index.js'))

        files.forEach(async (file) => {
            const sourcePath = path.join(directoryPath, file);
            let destinationPath = path.join(directoryDestinationPath, file);
            const entryStats = await stat(sourcePath);

            if (entryStats.isDirectory()) {
                handleV2DirFilesExport(sourcePath, destinationPath)
            } else if (entryStats.isFile()) {
                const data = await readFile(sourcePath, { encoding: 'utf8' });
                if (file == 'index.js') {
                    await writeFile(destinationPath,
                        `export {default as rootIndex} from "./rootIndex" \n ${data}`)
                } else {
                    createWebExportFile(data, destinationPath, removeLettersInStrAfterPeriod(file))
                }
            }
        });
    } catch (error) {
        console.log(error)
    }
})()

