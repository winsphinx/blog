+++
title = "ZeroClaw"
date = 2026-10-04T18:36:00+08:00
lastmod = 2026-10-09T18:31:58+08:00
tags = ["linux", "zeroclaw"]
categories = ["技术"]
draft = false
+++

我要在我的 armbian 小主机上部署一个 AI Agent，虽然当下能用的个人 Agent 很多，但是动辄需要几百兆甚至上千兆的内存，我的小主机根本吃不消。 <br/>
比较下来最终选中了 [ZeroClaw](https://github.com/zeroclaw-labs/zeroclaw/)，主要看中它体积小巧，性能强悍，不过需要折腾的地方也不少，特此记录。 <br/>

<!--more-->


## 安装 {#安装}

先根据官方提示安装，不过默认版本的内置接入通道是不包含 QQ 的，而对我而言用 QQ 作为接入是最适合的，因此需要带参数 `--features channel-qq` 编译后自行替换。但是自己搭建 rust 环境也比较麻烦，我借用了 GitHub Action 来实现。 <br/>
首先 fork 官方的仓库，把原仓库自带的 Github Action 脚本删除（为了给 Github 节省资源），然后添加下面这个脚本： <br/>


### 我的脚本 {#我的脚本}

```yaml
name: Build zeroclaw (ARM64 + AMD64)

on:
  # 手动触发
  workflow_dispatch:

env:
  CARGO_TERM_COLOR: always
  # 在此处添加额外的 cargo feature，多个用空格分隔
  EXTRA_FEATURES: "channel-qq"

jobs:
  build:
    name: Build (${{ matrix.target }})
    runs-on: ubuntu-24.04
    strategy:
      fail-fast: false
      matrix:
        include:
          - target: aarch64-unknown-linux-gnu   # ARM64：ARM服务器（交叉编译）
            cross: true
            gcc_pkg: gcc-aarch64-linux-gnu
            libc_pkg: libc6-dev-arm64-cross
            tool_prefix: aarch64-linux-gnu
          - target: x86_64-unknown-linux-gnu    # AMD64：原生，无需交叉工具链
            cross: false
            gcc_pkg: ""
            libc_pkg: ""
            tool_prefix: ""

    steps:
      - name: Checkout
        uses: actions/checkout@v7
        # 注意：docs 翻译用的 git submodule 构建不需要，不用加 submodules

      - name: Install Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.target }}

      - name: Install cross-compiler
        if: matrix.cross
        run: |
          sudo apt-get update
          # gcc 是交叉编译器，libc6-dev-*-cross 是对应架构的 C 库头文件
          # （ring 等 crate 编 C 代码时需要，缺了会报 bits/libc-header-start.h 找不到）
          sudo apt-get install -y --no-install-recommends ${{ matrix.gcc_pkg }} ${{ matrix.libc_pkg }}

      - name: Set cross linker
        if: matrix.cross
        run: |
          triple_upper=$(echo "${{ matrix.target }}" | tr '[:lower:]-' '[:upper:]_')
          linker="${{ matrix.tool_prefix }}-gcc"
          # 例如：CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_LINKER=aarch64-linux-gnu-gcc
          echo "CARGO_TARGET_${triple_upper}_LINKER=${linker}" >> "$GITHUB_ENV"
          echo "Using linker: ${linker}"

      - name: Cache cargo
        uses: Swatinem/rust-cache@v2
        with:
          key: ${{ matrix.target }}

      - name: Build
        run: cargo build --release --target ${{ matrix.target }} --features "$EXTRA_FEATURES"

      - name: Verify and strip
        run: |
          bin="target/${{ matrix.target }}/release/zeroclaw"
          file "$bin"
          if [ -n "${{ matrix.tool_prefix }}" ]; then
            "${{ matrix.tool_prefix }}-strip" "$bin" || true
          else
            strip "$bin" || true
          fi
          ls -lh "$bin"

      - name: Upload artifact
        uses: actions/upload-artifact@v7
        with:
          name: zeroclaw-${{ matrix.target }}
          path: target/${{ matrix.target }}/release/zeroclaw
          if-no-files-found: error
```

手工触发这个 Action，大约 10 分钟后编译完成，下载后替换官方版本即可。 <br/>


## 配置 {#配置}

配置 QQ 要先在 bot.q.qq.com 注册开发者（实名），创建机器人应用，拿到 AppID 和 AppSecret。还要在应用后台“事件订阅”开消息权限：单聊开 C2C 消息事件，群聊开群 @ 消息事件。 <br/>
安装完后，用 `zeroclaw quickstart` 按照提示配置，需要微调参数可以用 `zerocode` 作为 TUI 来修改，也可以直接修改 `~/.zeroclaw/config.toml` 配置文件。我的配置如下： <br/>


### 我的配置 {#我的配置}

```toml
schema_version = 3

[onboard_state]
quickstart_completed = true

[providers]

[providers.models]

[providers.models.nvidia]

[providers.models.nvidia.default]
api_key = "enc2:..."
model = "..."
fallback_models = ["..."]
fallback = ["openrouter.default"]
context_window = 1000000
temperature = 0.3
think = true
live_pricing = true

[providers.models.openrouter]

[providers.models.openrouter.default]
api_key = "enc2:.."
model = "..."
fallback_models = ["..."]
context_window = 1000000
temperature = 0.3
think = true
live_pricing = true

[[embedding_routes]]
hint = "embedding"
model_provider = "custom:https://..."
api_key = "enc2:..."
model = "..."
dimensions = 1536

[memory]
backend = "sqlite"
embedding_model = "hint:embedding"
vector_weight = 0.75
keyword_weight = 0.25
min_relevance_score = 0.35
conversation_retention_days = 30
daily_retention_days = 30

[channels]
session_ttl_hours = 24
debounce_ms = 2000
show_tool_calls = true

[channels.qq]

[channels.qq.default]
enabled = true
app_id = "..."
app_secret = "enc2:..."

[peer_groups]

[peer_groups.qq]
channel = "qq"
external_peers = ["*"]

[agents]

[agents.zeroclaw]
channels = ["qq.default"]
model_provider = "nvidia.default"
runtime_profile = "default"
risk_profile = "balanced"

[runtime_profiles]

[runtime_profiles.default]
agentic = true
agentic_timeout_secs = 1800
compact_context = true
delegation_timeout_secs = 900
keep_tool_context_turns = 8
max_actions_per_hour = 120
max_context_tokens = 1000000
max_cost_per_day_cents = 0
max_delegation_depth = 8
max_history_messages = 200
max_system_prompt_chars = 64000
max_tool_iterations = 100
max_tool_result_chars = 64000
memory_recall_limit = 10
parallel_tools = true
prompt_injection_mode = "compact"
shell_timeout_secs = 600
strict_tool_parsing = false

[runtime_profiles.default.history_pruning]
collapse_tool_results = true
enabled = true
keep_recent = 4
max_tokens = 8192

[runtime_profiles.default.thinking]
default_level = "medium"
native_thinking = false

[runtime_profiles.default.tool_receipts]
enabled = true
inject_system_prompt = true
show_in_response = false

[risk_profiles]

[risk_profiles.balanced]
allowed_commands = ["*"]
auto_approve = ["*"]
block_high_risk_commands = true
require_approval_for_medium_risk = false
forbidden_paths = ["/boot", "/dev", "/etc", "/mnt", "/opt", "srv", "/sys", "/usr", "/var", "~/.ssh"]
level = "supervised"
workspace_only = false
sandbox_enabled = false

[risk_profiles.balanced.delegation_policy]
mode = "allow"

[web_search]
enabled = true
search_provider = "tavily"
tavily_api_key = "enc2:..."

[data_retention]
enabled = true
retention_days = 90

[gateway]
session_ttl_hours = 24
```

用 `zeroclaw doctor` 检查配置，无误后用 `zeroclaw service install` 安装为系统服务，再用 `zeroclaw service start` 启动。也可以用系统自带的命令 `systemctl --user start|stop|status zeroclaw` 来执行。 <br/>
先用这个配置跑起来，然后就可以让 zeroclaw 按需调整配置了。要查看全部参数，可以用 `zeroclaw config list` ，也可以用 `zecocode` 在 TUI 下配置，还可以用 `http://127.0.0.1:42617` 在 WebUI 下使用。 <br/>

