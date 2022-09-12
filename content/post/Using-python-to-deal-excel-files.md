+++
title = "使用 Python 操作 Excel 文件"
date = 2022-08-28T13:46:00+08:00
lastmod = 2022-09-21T19:59:47+08:00
tags = ["Python"]
categories = ["技术"]
draft = false
+++

使用 Python 来处理 Excel 文件中的数据，主要会用到 pandas。而处理 Excel 文件本身，则用到 xlrd 和 xlwt，以及 xlutils 这几个库。 <br/>

<!--more-->


## 打开 Excel 文件 {#打开-excel-文件}

用 xlrd 模块读取 Excel 文件，支持 xls 和 xlsx 格式。 <br/>

```python
import xlrd
# 获取工作簿对象
book = xlrd.open_workbook(filename, formatting_info=True)  # xls格式
book = xlrd.open_workbook(filename, formatting_info=False)  # xlsx格式

# 使用子表索引创建工作表对象，可以用book.nsheets获取全部索引
sheet = book.sheets()[sheet_index]
sheet = book.sheet_by_index(sheet_indx)
# 使用子表名称创建工作表对象，可以用book.sheet_names()获取全部索引
sheet = book.sheet_by_name(sheet_name)

# 检查某个工作表是否导入完毕
boos.sheet_loaded(sheet_name or sheet_indx)
```


## 行、列、单元格读取 {#行-列-单元格读取}

读取的数据包括格式和数值两部分。 <br/>

```python
# 获取工作表中的有效行数
nrows = sheet.nrows
# 返回由该行中所有的单元格对象，每个值内容为：单元类型:单元数据
# 单元类型：empty:0，string:1，number:2，date:3，boolean:4，error:5
sheet.row(rowx, start_colx=0, end_colx=None)
sheet.row_slice(rowx, start_colx=0, end_colx=None)
# 返回由该行中所有单元格的数据类型
sheet.row_types(rowx, start_colx=0, end_colx=None)
# 返回由该行中所有单元格的数据
sheet.row_values(rowx, start_colx=0, end_colx=None)

# 获取工作表中的有效列数
ncols =sheet.ncols
# 返回由该列中所有的单元格对象，每个值内容为：单元类型:单元数据
sheet.col(colx, start_rowx=0, end_rowx=None)
sheet.col_slice(colx, start_rowx=0, end_rowx=None)
# 返回由该列中所有单元格的数据类型
sheet.col_types(colx, start_rowx=0, end_rowx=None)
# 返回由该列中所有单元格的数据
sheet.col_values(colx, start_rowx=0, end_rowx=None)

# 返回单元格对象
sheet.cell(rowx,colx)
# 返回单元格中的数据类型
sheet.cell_type(rowx,colx)
# 返回单元格中的数据
sheet.cell_value(rowx,colx)
```


## 新建工作簿 {#新建工作簿}

使用 xlwt 新建一个空白 Excel，填写数据。 <br/>

```python
import xlwt
# 创建一个工作簿并设置编码
workbook = xlwt.Workbook(encoding = "utf-8")
# 添加工作表
worksheet = workbook.add_sheet(sheet_name)
# 按需设置行高列宽
worksheet.row(i).height = H
worksheet.col(i).width = W
# 写入对应的行, 列, 值
worksheet.write(row, col, value)
# 还可以填写公式，如：
worksheet.write(row, col, xlwt.Formula('A1*B1'))
worksheet.write(row, col, xlwt.Formula('SUM(A1,B1)'))
worksheet.write(row, col, xlwt.Formula('HYPERLINK("https://www.link";"LINK_NAME")'))
# 保存
workbook.save(filename)
```


## 在原工作簿修改 {#在原工作簿修改}

如果在读取的 Excel 上做修改，则需要使用 xlutils 模块。 <br/>

```python
from xlutils.copy import copy
# 将xlrd对象拷贝转化为xlwt对象
new_book = copy(book)
# 获取转化后的工作表
new_sheet = new_book.get_sheet(0)
# 写入对应的行, 列, 值
new_sheet.write(row, col, value)
# 保存
new_book.save(filename)
```


## 格式处理 {#格式处理}

写入数据的同时，对单元格格式做处理。包括字体、外观、颜色、边框、背景、对齐方式等（根据需要选用）。 <br/>

```python
# 初始化样式
style = xlwt.XFStyle()

# 为样式创建字体
font = xlwt.Font()

# 字体名称
font.name = "Times New Roman"
# 加粗
font.bold = True
# 下划线
font.underline = True
# 斜体字
font.italic = True
# 字体颜色
font.colour_index = N  # 0~63

# 为样式创建边框
borders = xlwt.Borders()
# 无:0，细实线:1，小粗实线:2，细虚线:3，中细虚线:4，大粗实线:5，双线:6，细点虚线:7
# 大粗虚线:8，细点划线:9，粗点划线:10，细双点划线:11，粗双点划线:12，斜点划线:13
borders.left = 1
borders.right = 1
borders.top = 1
borders.bottom = 1
borders.left_colour = 0x40
borders.right_colour = 0x40
borders.top_colour = 0x40
borders.bottom_colour = 0x40

# 为样式创建背景
pattern = xlwt.Pattern()
# 背景样式
# NO_PATTERN, SOLID_PATTERN, 或从0x00 到 0x12
pattern.pattern = xlwt.Pattern.SOLID_PATTERN
# 背景颜色
pattern.pattern_fore_colour = N  # 0~63

# 为样式创建背景
alignment = xlwt.Alignment()
# 水平对齐方式：HORZ_GENERAL, HORZ_LEFT, HORZ_CENTER, HORZ_RIGHT, HORZ_FILLED, HORZ_JUSTIFIED, HORZ_CENTER_ACROSS_SEL, HORZ_DISTRIBUTED
alignment.horz = xlwt.Alignment.HORZ_CENTER

# 上下对齐方式：VERT_TOP, VERT_CENTER, VERT_BOTTOM, VERT_JUSTIFIED, VERT_DISTRIBUTED
alignment.vert = xlwt.Alignment.VERT_CENTER

# 设定样式
style.font = font
style.borders = borders
style.pattern = pattern
style.alignment = alignment

# 带样式写入
worksheet.write(row, col, value, style)
```