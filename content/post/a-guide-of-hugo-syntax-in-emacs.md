+++
title = "A Guide of Hugo Syntax in Emacs"
date = 2019-07-20T09:22:00+08:00
lastmod = 2019-11-02T08:38:25+08:00
tags = ["emacs", "org", "hugo", "blog"]
categories = ["技术"]
draft = false
+++

本文提供一些 Hugo Syntax 例子。

<!--more-->


## 文本 {#文本}

```text
- *粗体* *bold*
- /斜体/ /italic/
- _下划线_ _underline_
- =代码= =code=
- ~摘录~ ~verbatim~
- +删除线+ +strike-through+
```

-   **粗体** **bold**
-   _斜体_ _italic_
-   <span class="underline">下划线</span> <span class="underline">underline</span>
-   `代码` `code`
-   `摘录` `verbatim`
-   ~~删除线~~ ~~strike-through~~


## 链接 {#链接}

```text
- [[http://emacs.org]]
- [[http://emacs.org][Emacs]]
```

-   <http://emacs.org>
-   [Emacs](http://emacs.org)


## 列表 {#列表}


### 无序列表 {#无序列表}

```text
- 用 =-，+= 都可以。
  - 无序列表支持多级嵌套列表
  - 只要缩进就行
    - 再次缩进又是一层级
+ 再次回到第一层级
```

-   用 `-，+` 都可以。
    -   无序列表支持多级嵌套列表
    -   只要缩进就行
        -   再次缩进又是一层级
-   再次回到第一层级


### 有序列表 {#有序列表}

```text
1. 数字并不代表真实序号。
2. 系统自动给出编号。
6. [@6] 需要手工编号，用 [@N] 。
```

<ol class="org-ol">
<li>数字并不代表真实序号。</li>
<li>系统自动给出编号。</li>
<li value="6">需要手工编号，用 [@N] 。</li>
</ol>


## 公式 {#公式}


### 基本公式 {#基本公式}

-   这是行内公式(inline equation)的例子，用 `$...$` 或 `\(...\)` 包括：如 \\(E=mc^2\\) ，或是 \\(e^{i\pi}+1=0\\)。
-   这是行间公式(displayed equation)的例子，用 `$$...$$` 或 `\[...\]` 包括： \\[\cos\theta=1- \frac {2\*(\tan\alpha')^2\*(\tan\gamma')^2} {(\tan\alpha'\*\tan\gamma')^2+(\tan\alpha')^2+(\tan\gamma')^2}\\]
-   或是直接用 `\begin{equation}...\end{equation}` ：

<!--listend-->

```text
     \begin{equation}
      \label{eq_1}
      \alpha+\beta=\gamma+\delta
     \end{equation}
```

\begin{equation}
 \label{eq\_1}
 \alpha+\beta=\gamma+\delta
\end{equation}


### 多行公式 {#多行公式}


#### gather {#gather}

全部公式居中

```text
     \begin{gather}
      x=\alpha+\beta+\gamma \\
      y=\delta+\epsilon
     \end{gather}
```

\begin{gather}
 x=\alpha+\beta+\gamma \\\\\\
 y=\delta+\epsilon
\end{gather}


#### align {#align}

用 `&` 指定对齐

```text
     \begin{align}
      x&=\alpha+\beta+\gamma \\
      y&=\delta+\epsilon
     \end{align}
```

\begin{align}
 x&=\alpha+\beta+\gamma \\\\\\
 y&=\delta+\epsilon
\end{align}


#### split {#split}

单独一个编号，需要嵌套在 `equation` 中

```text
     \begin{equation}
      \begin{split}
       \cos 2x &= \cos^2 x - \sin^2 x \\
       &=2\cos^2x-1
      \end{split}
     \end{equation}
```

\begin{equation}
 \begin{split}
  \cos 2x &= \cos^2 x - \sin^2 x \\\\\\
  &=2\cos^2x-1
 \end{split}
\end{equation}


#### cases {#cases}

公式组合

```text
     \begin{equation}
      D(x)=\begin{cases}
      1, & \text{if } x \in \mathbb{Q} \\
      0, & \text{if } x \in \mathbb{R}
      \end{cases}
     \end{equation}
```

\begin{equation}
 D(x)=\begin{cases}
 1, & \text{if } x \in \mathbb{Q} \\\\\\
 0, & \text{if } x \in \mathbb{R}
 \end{cases}
\end{equation}


## 表格 {#表格}

直接用 org 的表格：

| Head A | Head B | Head C |
|--------|--------|--------|
| item A | item B | item C |


## 图片 {#图片}

用 `[[file:url]]` 插入，Hugo 会复制到 `<HUGO>/static/ox-hugo/` 目录下。
![](/ox-hugo/gnus.png)


## 代码 {#代码}

-   代码及输出文字

<!--listend-->

```C
  #include "stdlib.h"
  int main(int argc, char **argv) {
    printf("Hello World!");
    exit(0);
  }
```

```text
Hello World!
```

-   代码及输出图表

<!--listend-->

```plantuml
  爱丽丝 -> 鲍勃: 实线箭头
  爱丽丝 ->> 鲍勃: 实线空心箭头
  鲍勃 --> 爱丽丝: 虚线箭头
  爱丽丝 -\ 鲍勃: 半箭头
  爱丽丝 /-- 鲍勃: 虚线半箭头
  爱丽丝 \\-- 鲍勃: 虚线空心半箭头
  爱丽丝 ->o 鲍勃: 圆形+箭头
  爱丽丝 <-> 鲍勃: 双向箭头
```

{{< figure src="/ox-hugo/plantuml.png" >}}
