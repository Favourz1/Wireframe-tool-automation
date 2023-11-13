# Wireframe Tool Automation

## V1 (Index.js)

This helps simplify the automation of creating webExport files without the CLI prompt

Features:

- Read through all files in parent components directory
- Create web export files and index files

To get the best use of this tool component folder structure should be

.Components

..ComponentFolder \
 &nbsp; &nbsp; ..index.js \
 &nbsp; &nbsp; ..componentFileName

To run: (in root directory):

```
node index.js
```

## V2 (IndexV2.js)

This helps simplify the automation of creating webExport files with the CLI prompt.
It does it for specific folder names depending on user prompt answers

Features:

- Read through all files in a single component directory
- Create web export files and index files

To get the best use of this tool component folder structure should be

.Components

..ComponentFolder \
 &nbsp; &nbsp; ..index.js \
 &nbsp; &nbsp; ..componentFileName

To run: (in root directory):

```
node indexV2.js
```
