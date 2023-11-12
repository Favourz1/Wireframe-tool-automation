// console.log("Favour can code")
// const fs = require("fs")
import { readFile, writeFile, readdir, stat, mkdir } from "fs/promises"
import path from 'path';

// writeFile("message.txt", "Hello Favour, How are you", function (err) {
//     return err ? err : console.log("File has been Saved");
// })

// const generateName = require("sillyname")

// console.log(`The person name is : ${generateName()}`)


// readFile("message.txt", 'utf8', function (err, data) {
//     if (err) {
//         throw err
//     } else {
//         console.log("File has been read \n", data);
//         createWebExportFile(data)
//     }
// })

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

const directoryPath = 'components/';

(async () => {
    try {
        const files = await readdir(directoryPath)
        console.log('Files in the components directory:', files);

        files.forEach(async (file) => {
            const sourcePath = path.join(directoryPath, file);
            let destinationPath = path.join('webExport/', file);
            const entryStats = await stat(sourcePath);

            if (entryStats.isDirectory()) {
                const subFolderFiles = await readdir(sourcePath);
                await mkdir(destinationPath, { recursive: true });
                console.log(`files in ${sourcePath}:`, subFolderFiles)
                createComponentLazyLoadIndexFile(destinationPath, subFolderFiles)
                subFolderFiles.forEach(async (subFile) => {
                    let newSourcePath = path.join(sourcePath, subFile);
                    let newDestinationPath = path.join(destinationPath, subFile);
                    const data = await readFile(newSourcePath, { encoding: 'utf8' });
                    if (subFile === "index.js") {
                        await writeFile(newDestinationPath,
                            `export {default as rootIndex} from "./rootIndex" \n${data}`)
                    } else {
                        createWebExportFile(data, newDestinationPath, removeLettersInStrAfterPeriod(subFile))
                    }
                })
            } else if (entryStats.isFile()) {
                const data = await readFile(sourcePath, { encoding: 'utf8' });
                createWebExportFile(data, destinationPath, removeLettersInStrAfterPeriod(subFile))
            }
        });
    } catch (error) {
        console.log(error)
    }
})()

