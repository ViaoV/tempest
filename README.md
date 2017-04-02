# Tempest Client

Discussion: https://t.me/tempestclient


## Installation

Tempest is a cross platform DragonRealms client.

For now there is no release candidate however it can be executed from source.
This requires yarn, ruby, and the ruby SASS gem.
After cloning the repository:

```
npm install -g electron-prebuilt
gem install sass
yarn install
sass src/sass:src/css
yarn build
electron .
```
