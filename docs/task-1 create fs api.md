As Electron has enabled and recommended secure API patterns, we need to add API to follow that design, that is: create APi handler in main, and expose them via ipc renderer.

The API to add are mainly IO related. We'll be using fs-extra as file operation library and create the following APIs
- enumerating files with a given glob pattern
- fs for reading json file with a given file path, should take security into account
- fs for reading image binaries with a give file path, should take security into account
- fs for saving json files with contents and given file path, should take security into account


create a markdown file in the docs folder to document the implementation details and reasoning.
