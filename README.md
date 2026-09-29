# RogueFable3 《盗贼寓言 III》— 中文版 + Docker 部署

《盗贼寓言》网页 RogueLike 游戏（类似 DCSS），本仓库在原项目基础上增加了
**完整中文本地化**与**容器化部署**支持。

> 上游：https://github.com/jeason1997/RogueFable3
> 本仓库：https://github.com/Panda-995/RogueFable3

---

## 一、中文版

### 为什么需要这个版本

原项目虽有 `translator.js` 汉化机制，但词库只覆盖约 150 条（职业 / 种族 / 部分天赋），
且只有 16 个文件、36 处显式调用 `translator.getText()`。商店价签、HUD 状态条、
tooltip 里的显示名大多是英文标识符直接上屏，中文界面大量漏译。

### 本版做了什么

| 改动 | 文件 | 说明 |
| --- | --- | --- |
| 扩充词库 | `translator.js` | 150 条 → **755 条**，覆盖全部物品 / 怪物 / 场景物件 / 技能 / 天赋 / 状态 / 区域 / 地砖 / 投射物 / 界面文案 |
| 全局渲染挂钩 | `i18n-render.js`（新增） | 在 `Phaser.Text.prototype.updateText` 上挂钩，一处覆盖所有显示路径 |
| 中文字体回退 | `constants.js` | `FONT_NAME` 增加微软雅黑 / 苹方 / Noto Sans SC 等回退字体 |
| 语言与标题 | `index.html` | `lang="zh-CN"`、`<title>` 汉化 |

### 挂钩原理

Phaser 2.x 的 `Phaser.Text` 构造函数只把初始文本写进 `this._text`，
`this.text` 由 `setText()` 赋值；而**所有**渲染路径（构造、`setText`、`setStyle`）
最终都汇聚到 `updateText()` —— 它是文本上屏的唯一出口。

因此挂钩 `updateText` 即可一处覆盖全部，且零副作用：

```js
this.text = 译文;
try   { 原 updateText.call(this); }
finally { this.text = 原文; }   // 游戏逻辑看到的始终是原始字符串
```

词库查不到时原样输出英文，英文回退完全无损。

### 词库键 = 数据表主键

`utility.js` 的 `gs.capitalSplit` 被上游短路成 `return string;`，
所以 `niceName === 表键`（如 `ShortSword`）。所有显示名最终都以
`translator.getText(type.niceName)` 的形式查询，词库因此可以直接用表主键。

### 调试

浏览器控制台：

```js
i18n.size()    // 词库条目数
i18n.disable() // 临时关闭挂钩
i18n.enable()  // 恢复
```

---

## 二、Docker 部署

项目是**纯静态站点**（`index.html` + Phaser + 原生 JS，无构建步骤），
上游没有提供 Dockerfile，本仓库补上。

### 直接用预构建镜像

```bash
docker run -d --name roguefable3 -p 8080:80 \
  ghcr.io/panda-995/roguefable3:latest
```

打开 http://localhost:8080

### 用 compose

见仓库根目录 `docker-compose.yml`。

### 自己构建

```bash
docker build -t roguefable3 .
docker run -d -p 8080:80 roguefable3
```

### 多架构镜像

GitHub Actions（`.github/workflows/docker-build.yml`）通过 buildx + QEMU 构建
**linux/amd64** 与 **linux/arm64**，推送到 GHCR，可用一条 manifest 覆盖两者：

```bash
docker run -d -p 8080:80 ghcr.io/panda-995/roguefable3:latest
```

在 x86 机器和 ARM 设备（如树莓派 / Apple Silicon）上均可直接运行。

### 镜像说明

- 基础镜像：`nginx:1.27-alpine`（同时提供 amd64 / arm64）
- 无构建阶段，镜像体积主要来自 nginx（约 50 MB）
- gzip 开启；音频/字体长缓存，HTML 与 JS 不缓存以便发版即时生效
- 内置 `HEALTHCHECK`

---

## 三、目录结构

```
├── index.html              # 入口（已挂 i18n-render.js）
├── translator.js           # 中文词库 + getText / translate
├── i18n-render.js          # Phaser 文本渲染挂钩（新增）
├── constants.js            # 字体栈已加中文回退
├── ability/ character/ ... # 原项目游戏逻辑
├── assets/                 # 贴图 / 音频 / 字体
├── docker/nginx.conf       # nginx 站点配置
├── Dockerfile
└── .github/workflows/      # 多架构构建发布
```

---

## 四、致谢

- 汉化（原始）：Jeason1997
- 程序及美术：Justin Wang
- 音效：www.kenney.nl 和 ArtisticDude
- 音乐：Nooskewl Games
