kcs2-mapdata
============

map data processing for Kancolle Phase II

## Usage
- install dependencies
```bash
# add electron mirror if necessary
export ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/"
yarn
```

- get map data
```bash
yarn get-map
```

- use annotation tools to generate spot name file
```bash
yarn annotate
```
the spots name file will be output to `./data/notation.json`


Note: if you have trouble running this, try `export NODE_OPTIONS=--openssl-legacy-provider` beforehand.

- run
```bash
yarn sync
```
to sync spots name to `./out/WROLD_ID/MAP_ID/spots.json`

- run
```bash
yarn poi
```
to generate final map data for poi at `./data/final.json`

## Others
Some other scripts are used to draw a `svg` for preview, svg file will be saved at map dirs
- run `yarn dst` to get distance for landbase aircraft (`celldata.json` is necessary)

- run `yarn icon` to draw icons (`celldata.json` is necessary)
