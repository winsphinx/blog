+++
title = "三分损益法"
date = 2025-08-23T11:56:00+08:00
lastmod = 2025-08-23T18:23:02+08:00
tags = ["Python", "music"]
categories = ["技术"]
draft = false
+++

三分损益法是中国古代音乐理论中用于确定音律的一种数学方法，主要用于生成十二律（十二平均律的基础）和其他音阶音高，是中国传统音乐调律的核心技术之一。其基本原理是通过弦长或管长的三分损益（即增加或减少三分之一）来推算音阶中的音高关系。这种方法最早见于《管子》《吕氏春秋》等文献，战国时期已有系统论述，后在《乐书》《汉书·律历志》等文献中进一步完善。 <br/>

<!--more-->


## 基本原理 {#基本原理}

三分损益法的核心是通过对乐器（如琴或律管）的长度进行数学运算，生成不同音高。具体方法是： <br/>

-   三分损一：将弦长或管长分为三等份，去掉一份（即乘以 2/3），得到一个比原音高五度的音（纯五度）。 <br/>
-   三分益一：将弦长或管长分为三等份，增加一份（即乘以 4/3），得到一个比原音低五度的音（纯四度）。 <br/>
-   通过反复应用“损一”和“益一”，生成一系列音高，形成音阶。 <br/>


## 推算过程 {#推算过程}

以黄钟（基础音，相当于现代的 C4）为起点，假设其律管长度为 81 单位（古代常用 81 作为基数，便于计算）。 <br/>

| 律名 | 长度                                     | 频率                                                    | 对应现代音名 |
|----|----------------------------------------|-------------------------------------------------------|--------|
| 黄钟 | 81                                       | 1                                                       | C      |
| 林钟 | 81 × 2/3 = 54                            | 81/54 = 1.5                                             | G      |
| 太簇 | 54 × 4/3 = 72                            | 81/72 = 1.125                                           | D      |
| 南吕 | 72 × 2/3 = 48                            | 81/48 = 1.6875                                          | A      |
| 姑洗 | 48 × 4/3 = 64                            | 81/64 = 1.265625                                        | E      |
| 应钟 | 64 × 2/3 = 128/3 = 42.6667               | 81/(128/3) = 1.8984375                                  | B      |
| 蕤宾 | 128/3 × 4/3 = 512/9 = 56.8889            | 81/(512/9) = 729/512 = 1.423828125                      | F#     |
| 大吕 | 512/9 × 2/3 = 1024/27 = 37.9259          | 81/(1024/27) = 2187/1024 = 2.1357421875                 | C#     |
| 夷则 | 1024/27 × 4/3 = 4096/81 = 50.5679        | 81/(4096/81) = 6561/4096 = 1.601806640625               | G#     |
| 夹钟 | 4096/81 × 2/3 = 8192/243 = 33.7119       | 81/(8192/243) = 19683/8192 = 2.40380859375              | D#     |
| 无射 | 8192/243 × 4/3 = 32768/729 = 44.9485     | 81/(32768/729) = 59049/32768 = 1.802032470703125        | A#     |
| 仲吕 | 32768/729 × 2/3 = 65536/2187 = 29.9657   | 81/(65536/2187) = 177147/65536 = 2.703094482421875      | F      |
| 返回黄钟 | 65536/2187 × 4/3 = 262144/6561 = 39.9574 | 81/(262144/6561) = 531441/262144 = 2.027286529541015625 | C      |


## 与十二平均律对比 {#与十二平均律对比}

十二平均律将一个八度（频率比 2:1）均分为 12 个半音，每个半音的频率比为 2<sup>1/12</sup> = 1.059463094359295 。 <br/>

| 音名   | 三分损益法频率     | 十二平均律频率    | 偏差（音分，1半音=100 音分） |
|------|-------------|------------|-------------------|
| C（黄钟） | 1.0                | 1.0               | 0                 |
| C#（大吕） | 1.06787109375      | 1.059463094359295 | +13.69            |
| D（太簇） | 1.125              | 1.122462048309373 | +2.27             |
| D#（夹钟） | 1.201904296875     | 1.189207115002721 | +10.65            |
| E（姑洗） | 1.265625           | 1.259921049894873 | +4.54             |
| F（仲吕） | 1.3515472412109375 | 1.334839854170034 | +12.49            |
| F#（蕤宾） | 1.423828125        | 1.414213562373095 | +6.80             |
| G（林钟） | 1.5                | 1.498307076876682 | +1.13             |
| G#（夷则） | 1.601806640625     | 1.587401051968199 | +9.07             |
| A（南吕） | 1.6875             | 1.681792830507429 | +3.40             |
| A#（无射） | 1.802032470703125  | 1.781797436280678 | +11.37            |
| B（应钟） | 1.8984375          | 1.887748625363387 | +5.66             |

偏差计算：音分（cents）公式为 1200 &times; log_2(三分损益频率 / 平均律频率) 。例如，C#的偏差 = 1200 &times; log_2(1.06787109375 / 1.059463094359295) = 13.69 音分。 <br/>


## 编程可视化 {#编程可视化}

```python
# -*- coding: utf-8 -*-
import matplotlib.pyplot as plt
import numpy as np
from matplotlib import font_manager
import warnings

# 动态检查可用字体
available_fonts = [f.name for f in font_manager.fontManager.ttflist]
preferred_fonts = ['Noto Sans CJK SC', 'SimSun', 'Microsoft YaHei', 'PingFang SC', 'WenQuanYi Zen Hei', 'Arial Unicode MS']

# 查找第一个可用的中文字体
selected_font = None
for font in preferred_fonts:
    if font in available_fonts:
        selected_font = font
        break

if selected_font:
    plt.rcParams['font.sans-serif'] = [selected_font] + ['sans-serif']
else:
    warnings.warn("No Chinese fonts found. Chinese characters may display as boxes. Please install 'Noto Sans CJK SC' or another Chinese font.")
    plt.rcParams['font.sans-serif'] = ['sans-serif']

plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示问题

# 三分损益法计算律管长度
def triple_division_length(start_length=81, num_notes=12):
    lengths = [start_length]
    names = ["黄钟"]
    for i in range(num_notes):
        if i % 2 == 0:  # 三分损一：长度 * 2/3
            new_length = lengths[-1] * 2 / 3
        else:  # 三分益一：长度 * 4/3
            new_length = lengths[-1] * 4 / 3
        # 调整到同一八度（长度在81/2到81之间）
        while new_length > start_length:
            new_length /= 2
        while new_length < start_length / 2:
            new_length *= 2
        lengths.append(new_length)
        # 添加音名（按五度相生顺序）
        names.append({
            0: "林钟", 1: "太簇", 2: "南吕", 3: "姑洗", 4: "应钟",
            5: "蕤宾", 6: "大吕", 7: "夷则", 8: "夹钟", 9: "无射",
            10: "仲吕"
        }.get(i, "黄钟(循环)"))
    return lengths, names

# 计算十二律的律管长度
lengths, names = triple_division_length()

# 绘制柱状图并标记数值
plt.figure(figsize=(12, 6))
bars = plt.bar(names, lengths, color='skyblue', edgecolor='black')
plt.title('三分损益法生成的十二律律管长度', fontsize=14)
plt.xlabel('音名', fontsize=12)
plt.ylabel('律管长度 (单位)', fontsize=12)
plt.xticks(rotation=45)
plt.grid(True, axis='y', linestyle='--', alpha=0.7)

# 在柱子上方添加长度数值标签
for i, bar in enumerate(bars):
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width() / 2, height, f'{height:.4f}',
             ha='center', va='bottom', fontsize=10)

plt.tight_layout()

# 保存图表
plt.savefig('triple_division.png')
plt.show()
```

{{< figure src="/ox-hugo/triple_division.png" >}} <br/>

