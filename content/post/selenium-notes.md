+++
title = "Selenium 笔记"
date = 2021-08-20T18:41:00+08:00
lastmod = 2023-03-14T19:01:58+08:00
tags = ["Python", "selenium"]
categories = ["技术"]
draft = false
+++

Selenium 可以根据我们的指令，让浏览器自动加载页面，获取需要的数据，实现自动化操作。 <br/>

<!--more-->


## 安装 {#安装}


### 安装 selenium {#安装-selenium}

```shell
pip install selenium
```


### 安装驱动 {#安装驱动}

| 浏览器    | 驱动         |
|--------|------------|
| Firefox   | geckodriver  |
| Chrome    | chromedriver |
| Edge      | edgedriver   |
| IE        | IEDriver     |
| Opera     | operadriver  |
| PhantomJS | phantomjs    |


## 应用 {#应用}


### 基础 {#基础}

```python
from selenium import webdriver
# 对应不同的浏览器
driver = webdriver.Firefox()     # Firefox 浏览器
driver = webdriver.Chrome()      # Chrome 浏览器
driver = webdriver.Ie()          # Internet Explorer 浏览器
driver = webdriver.Edge()        # Edge 浏览器
driver = webdriver.Opera()       # Opera 浏览器
driver = webdriver.PhantomJS()   # PhantomJS

# 打开url网页
driver.get(url)

# 获取特定信息
driver.title  # 标题
driver.name  # 浏览器名称
driver.orientation  # 设备方向
driver.page_source  # 源码
driver.current_url  # 当前 url
driver.current_window_handle  # 当前窗口句柄
driver.window_handles  # 所有窗口句柄

# 关闭页面
driver.close()

# 关闭浏览器
driver.quit()
```


### 定位 {#定位}

```python
# 选择元素的方法
driver.find_element_by_id(value)
driver.find_element_by_name(value)
driver.find_element_by_class_name(value)
driver.find_element_by_tag_name(value)
driver.find_element_by_link_text(value)
driver.find_element_by_partial_link_text(value)
driver.find_element_by_xpath(value)
driver.find_element_by_css_selector(value)

# 选择多个元素的方法，返回列表
driver.find_elements_by_id(value)
driver.find_elements_by_name(value)
driver.find_elements_by_class_name(value)
driver.find_elements_by_tag_name(value)
driver.find_elements_by_link_text(value)
driver.find_elements_by_partial_link_text(value)
driver.find_elements_by_xpath(value)
driver.find_elements_by_css_selector(value)

# 另一种选择元素（组）的方法
from selenium.webdriver.common.by import By

driver.find_element(By.ID, value)
driver.find_element(By.NAME, value)
driver.find_element(By.CLASS_NAME, value)
driver.find_element(By.TAG_NAME, value)
driver.find_element(By.LINK_TEXT, value)
driver.find_element(By.PARTIAL_LINK_TEXT, value)
driver.find_element(By.XPATH, value)
driver.find_element(By.CSS_SELECTOR, value)

driver.find_elements(By.ID, value)
driver.find_elements(By.NAME, value)
driver.find_elements(By.CLASS_NAME, value)
driver.find_elements(By.TAG_NAME, value)
driver.find_elements(By.LINK_TEXT, value)
driver.find_elements(By.PARTIAL_LINK_TEXT, value)
driver.find_elements(By.XPATH, value)
driver.find_elements(By.CSS_SELECTOR, value)

# 举例
# 获取 class="nums" 的对象的文本
driver.find_element_by_class_name("nums").text

# 获取 id="account" 的对象的属性的值
driver.find_element_by_id("account").get_attribute("value")

# 定位到 id="submit" 的按钮并点击
driver.find_element_by_id("submit").click()

# 或者直接提交
driver.find_element_by_id("submit").submit()

# 或者也可以按回车键提交
from selenium.webdriver.common.keys import Keys
driver.find_element_by_id("submit").send_keys(Keys.RETURN)

# 定位到 name="user" 的输入框并填入用户名
driver.find_element_by_name("user").send_keys("zhang3")

# 清空输入框内容
driver.find_element_by_name("user").clear()

# 定位到 id="text" 的文本框并全选、剪切
from selenium.webdriver.common.keys import Keys
driver.find_element_by_id("text").send_keys(Keys.CONTROL, "a")
driver.find_element_by_id("text").send_keys(Keys.CONTROL, "x")
```


#### 页面等待 {#页面等待}

```python
# 隐式等待，就是简单设置一个等待时间（默认为0），对整个实例有效
driver = webdriver.Chrome()
driver.implicitly_wait(10)  # 等待10秒
driver.get(url)
driver.find_element_by_id(myId)

# 显式等待，按一定频率（默认0.5s）不断检测一次条件，直到相应元素生成，或达到最大时限
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
driver.get(url)

WebDriverWait(driver, 10, 0.5).until(EC.presence_of_element_located((By.ID, myId1)))

# 内置的判断条件，可以直接在 until/until_not 中使用
title_is
title_contains
visibility_of
visibility_of_element_located
invisibility_of_element_located
presence_of_element_located
presence_of_all_elements_located
text_to_be_present_in_element
text_to_be_present_in_element_value
frame_to_be_available_and_switch_to_it
element_to_be_clickable
element_to_be_selected
element_located_to_be_selected
element_selection_state_to_be
element_located_selection_state_to_be
alert_is_present
staleness_of
```


### 控制 {#控制}


#### 页面 {#页面}

```python
# 控制浏览器窗口大小
driver.set_window_size(480, 800)
driver.maximize_windows()  # 最大化

# 浏览器页面控制
driver.back()  # 后退
driver.forward()  # 前进
driver.refresh()  # 刷新
driver.close()  # 关闭
driver.quit()  # 退出

# 切换框架
driver.switch_to_frame("frameName")
driver.switch_to_default_content()  # 返回父 frame

# 切换窗口
driver.switch_to_window("windowName")
# 或者
for handle in driver.window_handles:
    driver.switch_to_window(handle)

# 切换弹窗
alert = driver.switch_to_alert()
alert.text  # 返回 alert/confirm/prompt 中的文字信息
alert.accept()  # 接受现有警告框
alert.dismiss()  # 解散现有警告框
alert.send_keys(text)  # 发送文本至警告框

# 选择下拉菜单
from selenium.webdriver.support.ui import Select
select = Select(driver.find_element_by_name("status"))
select.select_by_index(1)  # 按索引值选择
select.select_by_value("0")  # 按属性值选择
select.select_by_visible_text(u"选项三")  # 按文本值选择
deselect.select_by_index(1)  # 按索引值取消选择
deselect.select_by_value("0")  # 按属性值取消选择
deselect.select_by_visible_text(u"选项三")  # 按文本值取消选择

# 处理 cookie
driver.get_cookie(cookieName)  # 获取某个 cookie
driver.get_cookies()  # 获取全部 cookies
driver.delete_cookie(cookieName)  # 删除某个 cookie
driver.delete_all_cookies()  # 删除全部 cookies
driver.add_cookie(cookie_dict)  # 增加 cookie 字典

# 调用 JavaScript
js="window.scrollTo(100,450);"
driver.execute_script(js)
driver.execute_async_script(js)

# 页面截图
driver.save_screenshot(filename)
driver.get_screenshot_as_file(filename)
driver.get_screenshot_as_base64()
driver.get_screenshot_as_png()
```


#### 键盘 {#键盘}

```python
# 常用的键盘操作
from selenium.webdriver.common.keys import Keys
send_keys(Keys.BACK_SPACE)
send_keys(Keys.SPACE)
send_keys(Keys.TAB)
send_keys(Keys.ESCAPE)
send_keys(Keys.ENTER)
send_keys(Keys.CONTROL,"a")
send_keys(Keys.CONTROL,"c")
send_keys(Keys.CONTROL,"x")
send_keys(Keys.CONTROL,"v")
send_keys(Keys.F1)

# 上传文件可以通过发送文件路径来实现
driver.find_element_by_name("file").send_keys("/path/of/upload/file")
```


#### 鼠标 {#鼠标}

```python
# 导入 ActionChains 类
from selenium.webdriver import ActionChains

# 鼠标移动到 ac 位置
ac = driver.find_element_by_xpath("element")
ActionChains(driver).move_to_element(ac).perform()

# 在 ac 位置单击
ac = driver.find_element_by_xpath("elementA")
ActionChains(driver).move_to_element(ac).click(ac).perform()

# 在 ac 位置双击
ac = driver.find_element_by_xpath("elementB")
ActionChains(driver).move_to_element(ac).double_click(ac).perform()

# 在 ac 位置右击
ac = driver.find_element_by_xpath("elementC")
ActionChains(driver).move_to_element(ac).context_click(ac).perform()

# 在 ac 位置左键单击hold住
ac = driver.find_element_by_xpath("elementF")
ActionChains(driver).move_to_element(ac).click_and_hold(ac).perform()

# 将 ac1 拖拽到 ac2 位置
ac1 = driver.find_element_by_xpath("elementD")
ac2 = driver.find_element_by_xpath("elementE")
ActionChains(driver).drag_and_drop(ac1, ac2).perform()

# 可用的有
click
click_and_hold
double_click
drag_and_drop
key_down
key_up
move_to_element
perform
release
send_keys
send_keys_to_element
```

