+++
title = "使用 Python 操作 Excel 文件（又一篇）"
date = 2022-09-22T22:22:00+08:00
lastmod = 2022-09-23T18:28:05+08:00
tags = ["Python"]
categories = ["技术"]
draft = false
+++

在[上一篇]({{< relref "Using-python-to-deal-excel-files" >}})中，使用了 xlrd、xlwt 两个库 的组合来操作 Excel 文件，但有几个缺点： <br/>

-   虽然 xlrd 可以读 xls 和 xlsx，但 xlwt 只能写 xls； <br/>
-   xlwt 不能在原文件上修改，需要额外借助 xlutils。 <br/>

今天发现一个更好的库 `xlwings`​，正好弥补了上述两个缺陷。 <br/>

<!--more-->


## 安装 {#安装}

```shell
pip install xlwings
```

xlwings 基本使用流程是先建立一个 app 实例，在 app 下建立 book（工作簿），在 book 下建立 sheet（工作表），在 sheet 下对 range（单元格范围）、chart（图表）、picture（图片）、api（格式）等对象进行操作。 <br/>


## 新建或打开工作表 {#新建或打开工作表}

```python
import xlwings as xw

# 1. 创建一个app应用，其中：
app = xw.App(visible=True, add_book=False)
# visible=True 表示打开操作Excel过程可见
# add_book=False 表示启动app后不新建工作簿

# 2A. 新建一个工作簿
wb = app.books.add()

# 2B. 打开一个已经存在的工作簿
wb = app.books.open('filename.xlsx')

# 3A. 新建一个工作表
sht = wb.sheets.add('sheet_name')

# 3B. 打开一个已存在的工作表
sht = wb.sheets('sheet_name')
# 也可以使用索引选择工作表
sht = wb.sheets[0]

# 索引获取
wb.sheets.count

# 获取当前工作表名字
sht.name

# 获取单元格绝对路径
sht.range('B3').get_address()  # 即 $B$3
sht.range('B3').address  # 同上

# 获取指定工作表中数据的行数、列数
sht.used_range.last_cell.row
sht.used_range.last_cell.column

# 获取指定范围中数据的行数、列数
sht.range('A2:B2').row
sht.range('A2:B2').column

# 删除指定的工作表
wb.sheets('sheet_name').delete()
```


## 读取与修改单元格数据 {#读取与修改单元格数据}

```python
## 读取
# 读取单元格
sht.range('B1').value
sht.range(1, 2).value  # 也可使用 (行, 列) 格式定位，注意索引是以1开始

# 读取单元格范围
sht.range('B2:F2').value

# 按列读取单元格范围
sht.range('B7:C10').options(transpose=True).value)

## 写入
# 写入单个数据
sht.range('B1').value = 100

# 写入行
sht.range('B2').value = [1, 2, 3, 4]

# 写入列
sht.range('B3').options(transpose=True).value = ['赵', '钱', '孙', '李']

# 写入块数据（可按行或按列）
sht.range('B7').value = [['a', 'b'], ['c', 'd']]
sht.range('B9').options(transpose=True).value = [['a', 'b'], ['c', 'd']]

# 写入公式
sht.range('F2').formula = '=sum(B2:E2)'

## 删除
# 删除指定单元格数据
sht.range('B10').clear()

# 删除指定范围内数据
sht.range('B7:B9').clear()
```


## 格式调整 {#格式调整}

```python
# 合并单元格
sht.range('B3:C3').api.merge()
# 解除合并单元格
sht.range('B3:C3').api.unmerge()

# 设置行高、列宽
sht.range('A2').row_height = 25
sht.range('B2').column_width = 20

# 自动调试指定单元格高度和宽度
sht.range('B1').autofit()

# 设置指定单元格背景颜色
sht.range('B1').color = (93,199,221)

# 字体名字
sht.range('A1').api.Font.Name = '宋体'
# 字体大小
sht.range('A1').api.Font.Size = 28
# 字体颜色
sht.range('A1').api.Font.Color = (255,0,124)
# 是否加粗
sht.range('A1').api.Font.Bold = True
# 数字格式
sht.range('A1').api.NumberFormat = '0.0'

# 对齐方式
sht.range('A1').api.HorizontalAlignment = -4108
sht.range('A1').api.VerticalAlignment = -4130
# -4108 水平居中， -4131 靠左，-4152 靠右
# -4108 垂直居中（默认)，-4160 靠上，-4107 靠下，-4130 自动换行对齐

# 设置上边框线风格和粗细
sht.range('A1').api.Borders(8).LineStyle = 5
sht.range('A1:B4').api.Borders(8).Weight = 3
# Borders：1：左边线，2：右边线，3：上边线，4：下边线，5：左斜线，6：右斜线
#          7：外部左边线，8：外部上边线，9：外部下边线，10：外部右边线
#          11：内部竖线，12：内部横线
# LineStyle：1：实线，2：虚线，3：波浪线，4：点画线，5：双点画线
# Weight：边框粗细
```


## 图表处理 {#图表处理}

```python
# 插入图片
sht.pictures.add('image_file_name')

# 插入图表
cht = sht.charts.add()
# 加载数据
chart.set_source_data(sht.range('A1').expand())
# 设置图表类型，可从xw.constants.chart_types获取全部图表类型
cht.chart_type = 'line'
# 设置图表开始位置
cht.top = sht.range('D2').top
cht.left = sht.range('D2').left
```


## 保存退出 {#保存退出}

```python
# 保存新建的工作簿，并起一个名字（如果是对原文件做修改，直接save()即可）
wb.save('filename')

# 关闭工作簿，关闭Excel文件
wb.close()

# 销毁对象，退出Excel程序
app.quit()
```