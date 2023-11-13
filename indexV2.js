import { readFile, writeFile, readdir, stat, mkdir, access } from "fs/promises"
import path from 'path';


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
    console.log("createComponentLazyLoadIndexFile")
    console.log("path")
    console.log(path)
    console.log("filesArr")
    console.log(filesArr)

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

async function createDirIfNotExist() {
    try {
        await access(directoryDestinationPath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Directory doesn't exist, so create it
            await mkdir(directoryDestinationPath, { recursive: true });
        } else {
            // Some other error occurred
            throw error;
        }
    }
}



const directoryPath = 'components/MkdScript';
const directoryDestinationPath = 'webExport/Media/MkdScript';

(async () => {
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
                // const subFolderFiles = await readdir(sourcePath);
                // await mkdir(destinationPath, { recursive: true });
                // console.log(`files in ${sourcePath}:`, subFolderFiles)
                // subFolderFiles.forEach(async (subFile) => {
                //     let newSourcePath = path.join(sourcePath, subFile);
                //     let newDestinationPath = path.join(destinationPath, subFile);
                const data = await readFile(sourcePath, { encoding: 'utf8' });
                if (file === "index.js") {
                    return
                    await writeFile(destinationPath,
                        `export {default as rootIndex} from "./rootIndex" \n ${data}`)
                } else {
                    createWebExportFile(data, destinationPath, removeLettersInStrAfterPeriod(file))
                }
                // })
            } else if (entryStats.isFile()) {
                const data = await readFile(sourcePath, { encoding: 'utf8' });
                createWebExportFile(data, destinationPath, removeLettersInStrAfterPeriod(file))
            }
        });
    } catch (error) {
        console.log(error)
    }
})()

