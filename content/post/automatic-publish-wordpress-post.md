+++
title = "自动发布 WordPress 文章"
date = 2026-05-24T15:59:00+08:00
lastmod = 2026-07-29T18:08:37+08:00
tags = ["linux"]
categories = ["技术"]
draft = false
+++

为了适合“AI 生成文章-发布文章”一条龙流程，编写了一个脚本。 <br/>

<!--more-->


## 准备 {#准备}

WordPress 有 API 可以直接发布文章。先进入 Users，选用户名，进入后到 Application Passwords，创建一个应用密码，它是 24 位格式。 <br/>


## 脚本 {#脚本}

```shell
#!/bin/bash

# WordPress REST API 文章发布脚本
# 用法: ./wp-publish.sh <markdown文件路径> [标题]

set -e

# 配置（请根据实际情况修改）
WP_URL="${WP_URL:-https://URL/wp-json/wp/v2/posts}"
WP_USER="${WP_USER:-username}"
WP_PASS="${WP_PASS:-xxxx xxxx xxxx xxxx xxxx xxxx}"

# 参数检查
if [ $# -lt 1 ]; then
    echo "用法: $0 <markdown文件路径> [标题]"
    exit 1
fi

MD_FILE="$1"
TITLE="$2"

# 检查文件是否存在
if [ ! -f "$MD_FILE" ]; then
    echo "错误: 文件 '$MD_FILE' 不存在"
    exit 1
fi

# 读取Markdown内容
CONTENT=$(cat "$MD_FILE")

# 如果没有提供标题，尝试从文件第一行提取（# 标题）
if [ -z "$TITLE" ]; then
    FIRST_LINE=$(head -n1 "$MD_FILE" | sed 's/^#* //')
    if [[ "$FIRST_LINE" != "$(cat "$MD_FILE")" ]]; then
        TITLE="$FIRST_LINE"
    else
        TITLE="$(basename "$MD_FILE" .md)"
    fi
fi

echo "标题: $TITLE"
echo "文件: $MD_FILE"
echo "长度: $(echo "$CONTENT" | wc -c) 字符"

# 转义JSON特殊字符（双引号、反斜杠、换行符）
ESCAPED_CONTENT=$(printf '%s' "$CONTENT" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')

# 构造JSON payload
JSON="{\"title\":\"$TITLE\",\"content\":\"$ESCAPED_CONTENT\",\"status\":\"draft\"}"

# 发布文章
echo "正在发布到 WordPress..."

RESPONSE=$(curl -s -X POST \
    -u "$WP_USER:$WP_PASS" \
    -H "Content-Type: application/json" \
    -d "$JSON" \
    "$WP_URL")

# 检查响应
if echo "$RESPONSE" | grep -q '"id"'; then
    POST_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | cut -d: -f2)
    if command -v jq &>/dev/null; then
        POST_URL=$(echo "$RESPONSE" | jq -r '.link // empty')
    else
        POST_URL=$(echo "$RESPONSE" | grep -o '"link":"[^"]*"' | cut -d'"' -f4 | sed 's#\\/#\/#g')
    fi
    echo "✅ 发布成功！"
    echo "文章ID: $POST_ID"
    echo "文章链接: $POST_URL"
    echo "状态: 草稿（draft）"
else
    echo "❌ 发布失败"
    echo "错误信息: $RESPONSE"
    exit 1
fi
```


## 发布 {#发布}

这个脚本还可以给 AI agent 使用。首先给 AI agent 确定一个主题，让它生成文章，要求保存成 markdown 格式，再让它调用这个 shell 上传，这样就能全自动完成文章发布了。 <br/>

