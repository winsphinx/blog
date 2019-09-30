+++
title = "Writing LaTeX in Emacs"
date = 2019-09-30T21:31:00+08:00
lastmod = 2019-11-29T20:34:36+08:00
tags = ["emacs", "LaTeX"]
categories = ["技术"]
draft = false
+++

\\(\LaTeX\\) 是一个用于书写以及排版的计算机语言。它在写数学符号和公式方面尤其方便。

在 Emacs 中写 \\(\LaTeX\\) 通常使用 AUCTeX。

<!--more-->


## 综述 {#综述}

-   这是行内公式(inline equation)的例子，用 `$...$` 或 `\(...\)` 包括：如 \\(E=mc^2\\) ，或是 \\(e^{i\pi}+1=0\\)。
-   这是行间公式(displayed equation)的例子，用 `$$...$$` 或 `\[...\]` 包括：\\[ \cos\theta=1- \frac {2\*(\tan\alpha')^2\*(\tan\gamma')^2} {(\tan\alpha'\*\tan\gamma')^2+(\tan\alpha')^2+(\tan\gamma')^2} \tag{1} \\]


## 字体 {#字体}

| 写法              | 效果                 |
|-----------------|--------------------|
| `\mathbb{text}`   | \\(\mathbb{ABC}\\)   |
| `\mathbf{text}`   | \\(\mathbf{ABC}\\)   |
| `\mathrm{text}`   | \\(\mathrm{ABC}\\)   |
| `\mathtt{text}`   | \\(\mathtt{ABC}\\)   |
| `\mathcal{text}`  | \\(\mathcal{ABC}\\)  |
| `\mathscr{text}`  | \\(\mathscr{ABC}\\)  |
| `\mathfrak{text}` | \\(\mathfrak{ABC}\\) |


## 字号 {#字号}

| 写法               | 效果                   |
|------------------|----------------------|
| `\Huge AB`         | \\(\Huge AB\\)         |
| `\huge AB`         | \\(\huge AB\\)         |
| `\LARGE AB`        | \\(\LARGE AB\\)        |
| `\Large AB`        | \\(\Large AB\\)        |
| `\large AB`        | \\(\large AB\\)        |
| `\normalsize AB`   | \\(\normalsize AB\\)   |
| `\small AB`        | \\(\small AB\\)        |
| `\footnotesize AB` | \\(\footnotesize AB\\) |
| `\scriptsize AB`   | \\(\scriptsize AB\\)   |
| `\tiny AB`         | \\(\tiny AB\\)         |


## 变音符号 {#变音符号}

| 写法           | 效果               |
|--------------|------------------|
| `\acute{a}`    | \\(\acute{a}\\)    |
| `\bar{a}`      | \\(\bar{a}\\)      |
| `\breve{a}`    | \\(\breve{a}\\)    |
| `\check{a}`    | \\(\check{a}\\)    |
| `\dot{a}`      | \\(\dot{a}\\)      |
| `\ddot{a}`     | \\(\ddot{a}\\)     |
| `\grave{a}`    | \\(\grave{a}\\)    |
| `\hat{a}`      | \\(\hat{a}\\)      |
| `\mathring{a}` | \\(\mathring{a}\\) |
| `\tilde{a}`    | \\(\tilde{a}\\)    |


## 希腊字母 {#希腊字母}

| 大写字母 [^1]    | 写法         | 小写字母       | 写法       |
|--------------|------------|------------|----------|
| \\(\mathrm{A}\\) | `\mathrm{A}` | \\(\alpha\\)   | `\alpha`   |
| \\(\mathrm{B}\\) | `\mathrm{B}` | \\(\beta\\)    | `\beta`    |
| \\(\Gamma\\)     | `\Gamma`     | \\(\gamma\\)   | `\gamma`   |
| \\(\Delta\\)     | `\Delta`     | \\(\delta\\)   | `\delta`   |
| \\(\mathrm{E}\\) | `\mathrm{E}` | \\(\epsilon\\) | `\epsilon` |
| \\(\mathrm{Z}\\) | `\mathrm{Z}` | \\(\zeta\\)    | `\zeta`    |
| \\(\mathrm{H}\\) | `\mathrm{H}` | \\(\eta\\)     | `\eta`     |
| \\(\Theta\\)     | `\Theta`     | \\(\theta\\)   | `\theta`   |
| \\(\mathrm{I}\\) | `\mathrm{I}` | \\(\iota\\)    | `\iota`    |
| \\(\mathrm{K}\\) | `\mathrm{K}` | \\(\kappa\\)   | `\kappa`   |
| \\(\Lambda\\)    | `\Lambda`    | \\(\lambda\\)  | `\lambda`  |
| \\(\mathrm{M}\\) | `\mathrm{M}` | \\(\mu\\)      | `\mu`      |
| \\(\mathrm{N}\\) | `\mathrm{N}` | \\(\nu\\)      | `\nu`      |
| \\(\Xi\\)        | `\Xi`        | \\(\xi\\)      | `\xi`      |
| \\(\mathrm{O}\\) | `\mathrm{O}` | \\(\omicron\\) | `\omicron` |
| \\(\Pi\\)        | `\Pi`        | \\(\pi\\)      | `\pi`      |
| \\(\mathrm{P}\\) | `\mathrm{P}` | \\(\rho\\)     | `\rho`     |
| \\(\Sigma\\)     | `\Sigma`     | \\(\sigma\\)   | `\sigma`   |
| \\(\mathrm{T}\\) | `\mathrm{T}` | \\(\tau\\)     | `\tau`     |
| \\(\Upsilon\\)   | `\Upsilon`   | \\(\upsilon\\) | `\upsilon` |
| \\(\Phi\\)       | `\Phi`       | \\(\phi\\)     | `\phi`     |
| \\(\mathrm{X}\\) | `\mathrm{X}` | \\(\chi\\)     | `\chi`     |
| \\(\Psi\\)       | `\Psi`       | \\(\psi\\)     | `\psi`     |
| \\(\Omega\\)     | `\Omega`     | \\(\omega\\)   | `\omega`   |

[^1]: 与英文字母相同的大写希腊字母可以直接输入，不过是斜体。需要用 `\mathrm{}` 的字型调整为正体。


## 数学符号 {#数学符号}

| 描述  | 写法             | 效果                |
|-----|----------------|-------------------|
| 加    | `+`              | \\(+\\)             |
| 减    | `-`              | \\(-\\)             |
| 正负  | `\pm`            | \\(\pm\\)           |
| 叉乘  | `\times`         | \\(\times\\)        |
| 点乘  | `\cdot`          | \\(\cdot\\)         |
| 除    | `\div`           | \\(\div\\)          |
| 除    | `/`              | \\(/\\)             |
| 上标  | `a^b`            | \\(a^b\\)           |
| 下标  | `a_b`            | \\(a\_b\\)          |
| 下点  | `\ldots`         | \\(1,2,3,\ldots\\)  |
| 中点  | `\cdots`         | \\(1+2+3+\cdots\\)  |
| 竖点  | `\vdots`         | \\(\vdots\\)        |
| 斜点  | `\ddots`         | \\(\ddots\\)        |
| 分数  | `\frac{n}{m}`    | \\(\frac{n}{m}\\)   |
| 组合  | `{n =\choose k}` | \\({n \choose k}\\) |
| 平方根 | `\sqrt{x}`       | \\(\sqrt{x}\\)      |
| n 次方根 | `\sqrt[n]{x}`    | \\(\sqrt[n]{x}\\)   |
| 无穷  | `\infty`         | \\(\infty\\)        |
| 映射  | `\to`            | \\(\to\\)           |
| 向量  | `\vec{v}`        | \\(\vec{v}\\)       |
| 空心圈 | `\circ`          | \\(\circ\\)         |
| 实心圈 | `\bullet`        | \\(\bullet\\)       |
| 与    | `\oplus`         | \\(\oplus\\)        |
| 或    | `\otimes`        | \\(\otimes\\)       |
| 等于  | `=`              | \\(=\\)             |
| 不等于 | `\ne`            | \\(\ne\\)           |
| 恒等于 | `\equiv`         | \\(\equiv\\)        |
| 约等于 | `\approx`        | \\(\approx\\)       |
| 正比  | `\propto`        | \\(\propto\\)       |
| 大于  | `>`              | \\(>\\)             |
| 大于等于 | `\ge`            | \\(\ge\\)           |
| 大于等于 | `\geqslant`      | \\(\geqslant\\)     |
| 不小于 | `\nless`         | \\(\nless\\)        |
| 远小于 | `\ll`            | \\(\ll\\)           |
| 远大于 | `\gg`            | \\(\gg\\)           |


## 集合 {#集合}

| 描述 | 写法          | 效果              |
|----|-------------|-----------------|
| 子集 | `\subset`     | \\(\subset\\)     |
| 超集 | `\supset`     | \\(\supset\\)     |
| 非子集 | `\not\subset` | \\(\not\subset\\) |
| 非超集 | `\not\supset` | \\(\not\supset\\) |
| 并  | `\cup`        | \\(\cup\\)        |
| 交  | `\cap`        | \\(\cap\\)        |
| 差  | `\setminus`   | \\(\setminus\\)   |
| 非  | `\neg`        | \\(\neg\\)        |
| 属于 | `\in`         | \\(\in\\)         |
| 不属于 | `\notin`      | \\(\notin\\)      |
| 拥有 | `\ni`         | \\(\ni\\)         |


## 逻辑 {#逻辑}

| 描述   | 写法              | 效果                  |
|------|-----------------|---------------------|
| 存在   | `\exists`         | \\(\exists\\)         |
| 有且仅有一个 | `\exists!`        | \\(\exists!\\)        |
| 不存在 | `\nexists`        | \\(\nexists\\)        |
| 对于全部 | `\forall`         | \\(\forall\\)         |
| 逻辑或 | `\lor`            | \\(\lor\\)            |
| 逻辑和 | `\land`           | \\(\land\\)           |
| 暗示   | `\Longrightarrow` | \\(\Longrightarrow\\) |
| 暗示（仅当） | `\Longleftarrow`  | \\(\Longleftarrow\\)  |
| 相当于 | `\iff`            | \\(\iff\\)            |
| 首选右侧 | `\Rightarrow`     | \\(\Rightarrow\\)     |
| 首选左侧 | `\Leftarrow`      | \\(\Leftarrow\\)      |
| 优先等同于 | `\Leftrightarrow` | \\(\Leftrightarrow\\) |
| 因为   | `\because`        | \\(\because\\)        |
| 所以   | `\therefore`      | \\(\therefore\\)      |


## 几何 {#几何}

| 描述 | 写法         | 效果             |
|----|------------|----------------|
| 角度 | `\angle`     | \\(\angle\\)     |
| 三角 | `\triangle`  | \\(\triangle\\)  |
| 正方形 | `\square`    | \\(\square\\)    |
| 全等于 | `\cong`      | \\(\cong\\)      |
| 不全等于 | `\ncong`     | \\(\cong\\)      |
| 相似于 | `\sim`       | \\(\sim\\)       |
| 不相似于 | `\nsim`      | \\(\sim\\)       |
| 平行于 | `\parallel`  | \\(\parallel\\)  |
| 不平行于 | `\nparallel` | \\(\nparallel\\) |
| 垂直于 | `\perp`      | \\(\perp\\)      |
| 不垂直于 | `\not\perp`  | \\(\not\perp\\)  |


## 箭头 {#箭头}

| 描述   | 写法              | 效果                  |
|------|-----------------|---------------------|
| 上箭头 | `\uparrow`        | \\(\uparrow\\)        |
| 双线上箭头 | `\Uparrow`        | \\(\Uparrow\\)        |
| 下箭头 | `\downarrow`      | \\(\downarrow\\)      |
| 双线下箭头 | `\Downarrow`      | \\(\Downarrow\\)      |
| 上下箭头 | `\updownarrow`    | \\(\updownarrow\\)    |
| 双线上下箭头 | `\Updownarrow`    | \\(\Updownarrow\\)    |
| 长左箭头 | `\longleftarrow`  | \\(\longleftarrow\\)  |
| 双线长左箭头 | `\Longleftarrow`  | \\(\Longleftarrow\\)  |
| 长右箭头 | `\longrightarrow` | \\(\longrightarrow\\) |
| 双线长右箭头 | `\Longrightarrow` | \\(\Longrightarrow\\) |


## 微积分 {#微积分}

| 描述  | 写法         | 效果                            |
|-----|------------|-------------------------------|
| 微分  | `dx`         | \\(dx\\)                        |
| 偏微分 | `\partial x` | \\(\partial x\\)                |
| 向量微积分 | `\nabla`     | \\(\nabla\\)                    |
| 极限  | `\lim`       | \\(\lim\_{x\to\infty}\\)        |
| 求和  | `\sum`       | \\(\sum\_{n=1}^{\infty}a\_n\\)  |
| 求积  | `\prod`      | \\(\prod\_{n=1}^{\infty}a\_n\\) |
| 积分  | `\int`       | \\(\int\\)                      |
| 双重积分 | `\iint`      | \\(\iint\\)                     |
| 三重积分 | `\iiint`     | \\(\iiint\\)                    |
| 多重积分 | `\idotsint`  | \\(\idotsint\\)                 |
| 环路积分 | `\oint`      | \\(\oint\\)                     |


## 矩阵 {#矩阵}

| 描述 | 写法      | 效果                                           |
|----|---------|----------------------------------------------|
| 矩阵 | `matrix`  | \begin{matrix} x & y \\\\ z & v \end{matrix}   |
| 矩阵 | `vmatrix` | \begin{vmatrix} x & y \\\\ z & v \end{vmatrix} |
| 矩阵 | `Vmatrix` | \begin{Vmatrix} x & y \\\\ z & v \end{Vmatrix} |
| 矩阵 | `pmatrix` | \begin{pmatrix} x & y \\\\ z & v \end{pmatrix} |
| 矩阵 | `bmatrix` | \begin{bmatrix} x & y \\\\ z & v \end{bmatrix} |
| 矩阵 | `Bmatrix` | \begin{Bmatrix} x & y \\\\ z & v \end{Bmatrix} |


## 其他 {#其他}

| 描述 | 写法                                                  | 效果                                                                          |
|----|-----------------------------------------------------|-----------------------------------------------------------------------------|
| 下括号 | `\underbrace{}_{}`                                    | \\(\underbrace{1,2,3,\ldots}\_{n}\\)                                          |
| 上括号 | `\overbrace{}^{}`                                     | \\(\overbrace{1+2+3+\cdots+100}^{5050}\\)                                     |
| 括号大小 | `( \big( \Big( \bigg( \Bigg(`                         | \\(( \big( \Big( \bigg( \Bigg(\\)                                             |
| 颜色 | `\textcolor{blue}{}`                                  | \\(\textcolor{blue}{F=ma}\\)                                                  |
| 颜色块 | `\colorbox{#228B22}{}`                                | \\(\colorbox{#228B22}{F=ma}\\)                                                |
| 颜色框 | `\fcolorbox{red}{yellow}{}`                           | \\(\fcolorbox{red}{yellow}{F=ma}\\)                                           |
| 删除线 | `\cancel{}` 或 `\bcancel{}` 或 `\xcancel{}` 或 `\sout{}` | \\(\cancel{44}\\) 或 \\(\bcancel{55}\\) 或 \\(\xcancel{66}\\) 或 \\(\sout{77}\\) |
| 框线 | `\boxed{}`                                            | \\(\boxed{\pi=3.14\ldots}\\)                                                  |
| 上移 | `\overset{}{}`                                        | \\(\overset{A}{B}\\)                                                          |
| 下移 | `\underset{}{}`                                       | \\(\underset{A}{B}\\)                                                         |
| 上下分布 | `\atop`                                               | \\(AA \atop BB\\)                                                             |
