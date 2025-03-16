+++
title = "pie"
date = 2025-03-14T12:16:00+08:00
lastmod = 2025-07-08T21:04:36+08:00
tags = ["Python", "algorithm"]
categories = ["技术"]
draft = false
+++

今天是 3 月 14 日，&pi; 日。突然想尝试用 Python 来模拟布冯投针实验来计算 &pi;。 <br/>

<!--more-->


## 原理 {#原理}


### 实验设定 {#实验设定}

-   假设有一组平行线，线间距为 \\(d\\)。 <br/>
-   将一根长度为 \\(l\\) 的针（通常 \\(l \leq d\\)）随机投掷到平面上。 <br/>
-   针的中点到最近线的距离 \\(x\\) 在 \\([0, d/2]\\) 均匀分布。 <br/>
-   针与水平线的夹角 \\(\theta\\) 在 \\([0, \pi/2]\\) 均匀分布。 <br/>


### 相交条件 {#相交条件}

-   针与某条平行线相交的条件是：针的中点到最近线的距离 \\(x\\) 小于等于针的投影长度，即 \\(x \leq (l/2) \cdot \sin(\theta)\\)。 <br/>
-   这意味着针的一端跨过了某条线。 <br/>


### 概率计算 {#概率计算}

-   通过几何概率分析，针与线相交的概率 \\(P\\) 可以推导出为： <br/>
    \\[P = \frac{2l}{\pi d}\\] <br/>


### 核心思想 {#核心思想}

-   在实验中，通过大量投针，统计针与线相交的次数 \\(N\_{\text{cross}}\\) 和总投针次数 \\(N\_{\text{total}}\\)，计算相交概率的实验值： <br/>
    \\[P\_{\text{exp}} = \frac{N\_{\text{cross}}}{N\_{\text{total}}}\\] <br/>
-   根据理论公式 \\(P = \frac{2l}{\pi d}\\)，可以反推出 π 的估计值： <br/>
    \\[\pi \approx \frac{2l}{P\_{\text{exp}} \cdot d}\\] <br/>


## 实现 {#实现}

```python
import random
import math
import matplotlib.pyplot as plt

def buffon_needle_simulation(n, l, d):
    """
    布冯投针实验模拟
    参数:
    n - 投针次数
    l - 针的长度
    d - 平行线之间的距离
    返回:
    估计的 π 值
    """
    crossings = 0
    needles = []  # 存储针的信息用于可视化

    for _ in range(n):
        # 随机生成针的中点到最近线的距离 (0 到 d/2)
        x = random.uniform(0, d/2)
        # 随机生成针的角度 (0 到 π/2)
        theta = random.uniform(0, math.pi/2)

        # 计算针的中心坐标 (假设在 0 到 d 的范围内随机放置 y 坐标)
        y_center = random.uniform(0, d)
        # 计算针的端点坐标
        dx = (l/2) * math.cos(theta)
        dy = (l/2) * math.sin(theta)
        x1 = x - dx
        y1 = y_center - dy
        x2 = x + dx
        y2 = y_center + dy

        # 检查是否与线相交
        intersects = x <= (l/2) * math.sin(theta)
        if intersects:
            crossings += 1

        # 存储针的信息
        needles.append((x1, y1, x2, y2, intersects))

    # 计算概率和 π 估计值
    probability = crossings / n
    pi_estimate = (2 * l) / (probability * d) if probability > 0 else float('inf')

    # 可视化
    if n <= 100:  # 限制可视化的针数，避免过于密集
        fig, ax = plt.subplots(figsize=(8, 8))

        # 绘制平行线
        for i in range(int(d * 2)):
            ax.axhline(i * d, color='gray', linestyle='--', alpha=0.5)

        # 绘制针
        for x1, y1, x2, y2, intersects in needles:
            color = 'red' if intersects else 'blue'
            ax.plot([x1, x2], [y1, y2], color=color, linewidth=1.5)

        ax.set_xlim(-d, d)
        ax.set_ylim(-d/2, 1.5*d)
        ax.set_aspect('equal')
        ax.set_title(f"Buffon's Needle Simulation (n={n})")
        plt.xlabel("x")
        plt.ylabel("y")
        plt.show()

    return pi_estimate

# 设置参数
n = 1000   # 投针次数（可视化时建议用较小的值）
l = 1.0    # 针的长度
d = 1.5    # 线间距

# 运行模拟
estimated_pi = buffon_needle_simulation(n, l, d)

# 输出结果
print(f"投针次数: {n}")
print(f"针的长度: {l}")
print(f"线间距: {d}")
print(f"估计的 π 值: {estimated_pi}")
print(f"实际的 π 值: {math.pi}")
print(f"误差: {abs(estimated_pi - math.pi)}")
```


## 结果 {#结果}

> 投针次数: 100 <br/>
> 针的长度: 1.0 <br/>
> 线间距: 1.5 <br/>
> 估计的 π 值: 3.1746031746031744 <br/>
> 实际的 π 值: 3.141592653589793 <br/>
> 误差: 0.03301052101338131 <br/>
> 
> 投针次数: 1000 <br/>
> 针的长度: 1.0 <br/>
> 线间距: 1.5 <br/>
> 估计的 π 值: 3.134796238244514 <br/>
> 实际的 π 值: 3.141592653589793 <br/>
> 误差: 0.006796415345279083 <br/>
> 
> 投针次数: 10000 <br/>
> 针的长度: 1.0 <br/>
> 线间距: 1.5 <br/>
> 估计的 π 值: 3.14911037631869 <br/>
> 实际的 π 值: 3.141592653589793 <br/>
> 误差: 0.007517722728896725 <br/>

{{< figure src="/ox-hugo/buffon.png" >}}

