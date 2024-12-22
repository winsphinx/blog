+++
title = "屏幕宠物"
date = 2024-12-22T12:22:00+08:00
lastmod = 2025-01-15T18:18:37+08:00
tags = ["Python"]
categories = ["技术"]
draft = false
+++

写了个 Python 程序，用到了 tkinter 和 pillow 模块，实现在桌面播放 gif 图片，给桌面增加一点节日气氛。 <br/>

<!--more-->


## Python {#python}

具体如下： <br/>

```python
import tkinter as tk
from PIL import Image, ImageTk, ImageSequence

class DesktopPet:
    def __init__(self, gif_path):
        self.root = tk.Tk()
        self.is_borderless = True  # 初始化为无边框状态

        self.root.title("")  # 设置窗口标题
        self.root.overrideredirect(self.is_borderless)  # 去掉边框
        self.root.attributes("-topmost", True)  # 窗口置顶
        self.root.attributes("-transparentcolor", "white")  # 设置透明颜色
        self.root.attributes("-toolwindow", True)  # 去掉最大化最小化

        # 禁用窗口最大化、最小化按钮
        self.root.resizable(False, False)  # 禁止调整窗口大小

        # 加载并处理 GIF 图像
        self.frames = []
        self.width, self.height = 0, 0
        self.load_and_process_gif(gif_path)

        # 创建一个标签控件来显示GIF
        self.label = tk.Label(self.root, image=self.frames[0], bg="white")  # 设置白色背景
        self.label.pack()

        # 设置帧动画
        self.frame_index = 0
        self.update_frame()

        # 初始化宠物的位置
        self.x, self.y = 100, 100
        self.root.geometry(f"{self.width}x{self.height}+{self.x}+{self.y}")

        # 定时器检查鼠标位置
        self.check_mouse_position()

    def load_and_process_gif(self, gif_path):
        gif = Image.open(gif_path)
        # 缩小尺寸
        original_width, original_height = gif.size
        self.width = original_width // 2
        self.height = original_height // 2

        # 处理每一帧：缩小并去掉黑色背景
        for frame in ImageSequence.Iterator(gif):
            frame = frame.convert("RGBA")  # 转换为 RGBA 模式
            # 缩小图片
            frame = frame.resize((self.width, self.height), Image.Resampling.LANCZOS)

            # 替换黑色背景为透明
            datas = frame.getdata()
            new_data = []
            for item in datas:
                if item[:3] == (0, 0, 0):  # 如果是黑色
                    new_data.append((255, 255, 255, 0))  # 替换为透明
                else:
                    new_data.append(item)
            frame.putdata(new_data)

            # 转换为 ImageTk.PhotoImage 格式
            self.frames.append(ImageTk.PhotoImage(frame))

    def update_frame(self):
        self.frame_index = (self.frame_index + 1) % len(self.frames)
        self.label.config(image=self.frames[self.frame_index])
        self.root.after(100, self.update_frame)  # 每100ms更新一次帧

    def check_mouse_position(self):
        # 获取鼠标的屏幕位置
        mouse_x, mouse_y = self.root.winfo_pointerxy()

        # 获取窗口的屏幕范围
        x1 = self.root.winfo_x()
        y1 = self.root.winfo_y()
        x2 = x1 + self.width
        y2 = y1 + self.height

        # 判断鼠标是否在窗口范围内
        if x1 <= mouse_x <= x2 and y1 <= mouse_y <= y2:
            if self.is_borderless:  # 如果当前是无边框状态
                self.is_borderless = False
                self.root.overrideredirect(False)  # 显示窗口栏
        else:
            if not self.is_borderless:  # 如果当前是有边框状态
                self.is_borderless = True
                self.root.overrideredirect(True)  # 隐藏窗口栏

        # 定时器再次检查
        self.root.after(200, self.check_mouse_position)  # 每200ms检查一次

    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    pet = DesktopPet("pet.gif")  # 替换为你的GIF文件路径
    pet.run()
```

