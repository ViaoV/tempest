# Tempest Client

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

## Current Features:

- **General**
  - Automatically handles and request commands lost to roundtime and type ahead
    errors
  - Automatically throttles input to mitigate type ahead errors
  - Fully cross platform and can be run in Windows, OSX, and Linux.
-**OS Integration**
  - Scripts can launch native desktop notifications.
- **Scripting**
  - Full featured scripting using CoffeeScript
  - Supports for the StormFront scripting language
  - Store character sessions for one click login
  - Run multiple scripts at the same time
- **Mapping**
  - Full map of the realms with location detection
  - Clicking on a map node will move you to that node
