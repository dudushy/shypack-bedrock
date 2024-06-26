![stars][stars] ![watchers][watchers] ![forks][forks] ![issues][issues] ![pull_requests][pull_requests] ![branches][branches]

# shypack-bedrock
:zap: A Minecraft Bedrock Addon Pack.

---
## Prerequisites:
- [NodeJS `v20.11.0`](https://nodejs.org/download/release/v20.11.0/)

## How to install and run:
1. Set the execution policy to bypass using `PowerShell`:
    ```powershell
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    ```
2. Ensure that the Minecraft Bedrock Edition client can make "loopback" requests using `PowerShell`:
    ```powershell
    CheckNetIsolation.exe LoopbackExempt -a -p=S-1-15-2-1958404141-86561845-1752920682-3514627264-368642714-62675701-733520436
    ```
3. Install packages:
    ```bash
    npm ci
    ```
4. Select the addon you want to build then rename the `PROJECT_NAME` in the `.env` file
5. Run project:
    ```bash
    npm start
    ```

## How to build:
1. Select the addon you want to build then rename the `PROJECT_NAME` in the `.env` file
2. Run the addon command:
    ```bash
    npm run mcaddon
    ```

## Useful links:

- [Build a gameplay experience with TypeScript](https://learn.microsoft.com/en-us/minecraft/creator/documents/scriptinggettingstarted?view=minecraft-bedrock-stable)
- [Minecraft Bedrock Edition Documentation](https://bedrock.dev/)
- [Bedrock Wiki](https://wiki.bedrock.dev/)
- [Formatting codes](https://minecraft.fandom.com/wiki/Formatting_codes)
- [Online UUID Generator](https://www.uuidgenerator.net/)
- [A list of image galleries on Minecraft Wiki](https://minecraft-archive.fandom.com/wiki/Category:Galleries)

[forks]: https://img.shields.io/github/forks/dudushy/shypack-bedrock
[stars]: https://img.shields.io/github/stars/dudushy/shypack-bedrock
[watchers]: https://img.shields.io/github/watchers/dudushy/shypack-bedrock
[issues]: https://badgen.net/github/issues/dudushy/shypack-bedrock
[pull_requests]: https://badgen.net/github/prs/dudushy/shypack-bedrock
[branches]: https://badgen.net/github/branches/dudushy/shypack-bedrock
