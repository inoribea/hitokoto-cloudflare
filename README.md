# Hitokoto-Cloudflare
使用 Cloudflare Pages 搭建的简洁、快速的一言（Hitokoto）API。

## 使用方法
1. 分叉此存储库。
2. 部署到 Cloudflare Pages。
3. **自定义本地句子：**
   - 在项目根目录创建 `.tmp` 文件（例如 `hitokoto.tmp`）。
   - 在 `.tmp` 文件中，每行写入一句一言内容。
   - 运行 `node generate-sentences.js` 脚本，它会将 `.tmp` 文件转换为 `sentences/` 目录下的 JSON 文件，并自动被 API 引用。
4. **自定义远程句子来源（可选）：**
   - 在 Cloudflare Pages 的环境变量中设置 `CHARSET`。
   - `CHARSET` 可以是 JSON 字符串，支持两种格式：
     - **URL 映射对象：**
       ```json
       {
         "a": "https://example.com/a.json",
         "b": "https://example.com/b.json"
       }
       ```
       这样可自定义各类别句子的来源（URL）。
     - **URL 数组：**
       ```json
       [
         "https://example.com/a.json",
         "https://example.com/b.json"
       ]
       ```
       API 将从这些 URL 获取句子数据，并根据文件名（例如 `a.json` 对应 `a` 类别）自动识别类别。
   - 未设置 `CHARSET` 时，默认自动引用 [hitokoto-osc/sentences-bundle](https://github.com/hitokoto-osc/sentences-bundle) 官方仓库的远程 json 文件。
5. 部署成功后直接访问即可，使用方法请参考 [一言开发者中心](https://developer.hitokoto.cn/sentence/)。

## 已支持特性
- [x] 支持指定返回字符集（通过 Cloudflare 环境变量 `CHARSET` 或自动引用官方远程 json）
- [x] 支持指定返回句子的长度筛选（`min_length` 和 `max_length` 参数）
- [x] 支持自定义本地句子文件（通过 `generate-sentences.js` 脚本）
- [x] `CHARSET` 环境变量支持 URL 数组作为远程句子来源
- [x] 支持 `encode=js` 参数，可将一言内容直接注入到指定 DOM 元素（配合 `select` 参数）

## 声明
本仓库存储的程序是一个语录 API，语录数据来源于仓库根目录中的 sentences 文件夹，该数据集基于 [hitokoto-osc/sentences-bundle](https://github.com/hitokoto-osc/sentences-bundle)。本仓库作者不对数据内容的准确性或完整性负责，也不为其提供任何形式的保证。

著作权：本仓库中的语录数据并非完全由本仓库作者持有。如果您是原句作者且希望移除您的句子，请与 [hitokoto-osc](https://github.com/hitokoto-osc) 联系。

[molikai-work](https://github.com/molikai-work) 于2025/01/20（UTC+8）从 [hitokoto-osc/sentences-bundle](https://github.com/hitokoto-osc/sentences-bundle) 将 [sentences](https://github.com/hitokoto-osc/sentences-bundle/tree/master/sentences) 复制到了 [molikai-work/hitokoto-cloudflare](https://github.com/molikai-work/hitokoto-cloudflare) 的 [sentences](https://github.com/molikai-work/hitokoto-cloudflare/tree/main/sentences) 中。

## 许可证
本程序采用 AGPL-3.0 许可证授权。

这意味着，如果您修改了代码并且将修改后的版本发布或部署（例如作为服务），那么您必须公开源代码；  
如果您使用 AGPL-3.0 授权的代码构建服务，您的修改代码（如果有）也应当可供用户获取，并且这些用户有权查看和获取修改后的代码。
