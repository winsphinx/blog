+++
title = "爬了个虫"
date = 2023-07-13T19:05:00+08:00
lastmod = 2023-08-04T18:38:56+08:00
tags = ["Python", "xpath"]
categories = ["技术"]
draft = false
+++

今天学了点 XPath 的用法，顺便爬了些图片。 <br/>

<!--more-->


## XPath {#xpath}


### 节点 {#节点}

在 XPath 中，有七种类型的节点：元素、属性、文本、命名空间、处理指令、注释以及文档（根）节点。 <br/>

| 表达式   | 描述         |
|-------|------------|
| `foo`    | 选择此节点的子节点 |
| `/`      | 选择根节点的子节点 |
| `//`     | 从匹配的节点选择其子节点 |
| `.`      | 选择当前节点 |
| `..`     | 选择父节点   |
| `@`      | 选择属性     |
| `*`      | 匹配任意元素节点 |
| `@*`     | 匹配任意属性节点 |
| `node()` | 匹配任意类型节点 |


### 谓语 {#谓语}

谓语被嵌在方括号中，用来查找某个特定的节点或者包含某个指定的值的节点。 <br/>

| 表达式                                 | 描述                                                            |
|-------------------------------------|---------------------------------------------------------------|
| /bookstore/book[1]                     | 选取属于 bookstore 子元素的第一个 book 元素（注意是下标是 1 开始）。 |
| /bookstore/book[last()]                | 选取属于 bookstore 子元素的最后一个 book 元素。                 |
| /bookstore/book[last()-1]              | 选取属于 bookstore 子元素的倒数第二个 book 元素。               |
| /bookstore/book[position()&lt;3]       | 选取最前面的两个属于 bookstore 元素的子元素的 book 元素。       |
| //title[@lang]                         | 选取所有拥有名为 lang 的属性的 title 元素。                     |
| //title[@lang='eng']                   | 选取所有 title 元素，且这些元素拥有值为 eng 的 lang 属性。      |
| /bookstore/book[price&gt;35.00]        | 选取 bookstore 元素的所有 book 元素，且其中的 price 元素的值须大于 35.00。 |
| /bookstore/book[price&gt;35.00]//title | 选取 bookstore 元素中的 book 元素的所有 title 元素，且其中的 price 元素的值须大于 35.00。 |


## Code {#code}

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import concurrent.futures
import os
from urllib.parse import urljoin

import requests
from lxml import etree


class Wallpaper:
    def __init__(self, address):
        self.base_url = f"https://www.youwu.cc/{address}/"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.162 Safari/537.36"
        }
        self.session = requests.Session()

        os.makedirs("images", exist_ok=True)

    def fetch(self):
        base_page = self.session.get(url=self.base_url, headers=self.headers)
        base_tree = etree.HTML(base_page.content)
        max_page = int(base_tree.xpath("//div[@class='wrap page clearfix']/a[1]/text()")[0][2:])

        for page in range(1, max_page + 1):
            page_url = self.base_url if page == 1 else f"{self.base_url}index_{page}.html"
            main_page = self.session.get(url=page_url, headers=self.headers)
            main_tree = etree.HTML(main_page.content)

            for sub_url in main_tree.xpath("//div[@class='photo']//a/@href"):
                album_url = urljoin(self.base_url, sub_url)
                album_page = self.session.get(url=album_url, headers=self.headers)
                album_tree = etree.HTML(album_page.content)

                max_image = int(album_tree.xpath("//div[@class='page']//a[1]/text()")[0][2:])
                for image in range(1, max_image + 1):
                    image_url = album_url if image == 1 else f"{album_url[:-5]}_{image}.html"
                    image_page = self.session.get(url=image_url, headers=self.headers)
                    image_tree = etree.HTML(image_page.content)

                    for picture_url in image_tree.xpath("//div[@class='photo']/a/img/@src"):
                        filename = os.path.basename(picture_url)
                        filepath = os.path.join("images", filename)

                        with open(filepath, "wb") as f:
                            response = self.session.get(picture_url, headers=self.headers)
                            response.raise_for_status()
                            f.write(response.content)
                            print(f"{filename} ... OK!")


if __name__ == "__main__":
    names = ["mygirl", "xiuren", "xiaoyu", "imiss"]

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [executor.submit(Wallpaper(name).fetch) for name in names]

    for future in concurrent.futures.as_completed(futures):
        try:
            future.result()
        except Exception as e:
            print(f"Exception occurred: {e}")
```

