+++
title = "Learning Hy"
date = 2021-10-23T18:57:00+08:00
lastmod = 2021-10-23T20:49:57+08:00
tags = ["Python", "hy"]
categories = ["技术"]
draft = false
+++

Hy is a lisp dialect built on top of python. This is achieved by converting hy code to python’s abstract syntax tree (ast). This allows hy to call native python code or python to call native hy code as well.

<!--more-->


## 基础 {#基础}

以下为 Hy 以及对应的 Python 代码：


### S-表达式 {#s-表达式}

```hy
(function args)
;; function(args)
(+ 4 1 2 3)
;; 4 + 1 + 2 + 3
(* 2 (** 3 2))
;; 2 * (3 ** 2)
(not (= 5 4))
;; not (5 == 4)
```


### 变量 {#变量}

```hy
(setv x 42)
;; x = 42
```


### 函数 {#函数}

```hy
(defn name [args]
  "doc-string"
  body)
;; def name(args):
;;     """doc-string"""
;;     body

;; 可选参数
(defn ab [a &optional[b 2]] [a b])
;; def ab(a, b=2):
;;     return [a b]

;; 可变参数
(defn something-fancy [something &rest descriptions &kwargs props] (print something descriptions props))
;; def something-fancy(something, *descriptions, **props):
;;     print(something, *descriptions, **props)

;; 匿名函数
(map (fn [x] (* x x)) [1 2 3 4])  ;=> [1 4 9 16]
;; (map lambda x: x * x, [1, 2, 3, 4])
```


### 序列 {#序列}

```hy
;; 元组
(setv mytuple (, 1 2))
;; mytuple = (1, 2)

;; 列表
(setv mylist [1 2 3 4])
;; mylist = [1, 2, 3, 4]
(get mylist 1)
;; mylist[1]
(cut mylist 1 3)
;; mylist[1:3]
(assoc mlist 2 10)
;; mylist[2] = 10

;; 字典
(setv mydict {"key1" 42 "key2" 250}) or (setv mydict {:key1 42 :key2 250})
;; mydict = {"key1": 42, "key2":250}
(get mydict "key1") or (:key1 mydict)
;; mydict["key1"]
(assoc mydict "key3" 996)
;; mydict["key3"] = 996
```


### Python 互操作 {#python-互操作}

```hy
(import datetime)
;; import datetime
(import [functools [partial reduce]])
;; from functools import partial, reduce
(import [matplotlib.pyplot :as plt])
;; import matplotlib.pyplot as plt

(.split (.strip "Hello World "))
;; "Hello World ".strip().split()
;; 可以采用穿线宏表达法，更加接近于链式调用的写法
(-> "Hello World " (.strip) (.split))

;; 穿线宏有头部穿线……
(-> 4 (- 2) (+ 1))  ;=> 3
;; 相当于
(+ (- 4 2) 1)
;; ……以及尾部穿线
(->> 4 (- 2) (+ 1)) ;=> -1
;; 相当于
(+ 1 (- 2 4))
```


### 结构控制 {#结构控制}

```hy
;; 单一条件
(if (condition) true-body false-body)
;; if condition:
;;     true-body
;; else:
;;     false-body

;; 多条件入口
(cond
  [(= val 42) (print "Same")]
  [(< val 42) (print "Less")]
  [(> val 42) (print "More")])
;; if val == 42:
;;     print("Same")
;; elif val < 42:
;;     print("Less")
;; elif val > 42:
;;     print("More")

;; 多语句使用do组成块
(do
  (body-1)
  (body-2))
```


### 类 {#类}

```hy
(defclass Wizard [object]
  (defn --init-- [self spell]
    (setv self.spell spell))

  (defn get-spell [self]
    self.spell))
;; defclass Wizard(object):
;;     def __init__(self, spell):
;;         self.spell = spell
;;     def get_spell(self):
;;         return self.spell
```


## 练手 {#练手}

学以致用，随手写了一个抓取必应壁纸的小程序——

```hy
(import os re requests)
(setv URL "https://www.bing.com/")
(setv NAME (-> (re.compile "url\(/th\?id=(.*?\.jpg).*\)") (.search (-> (requests.get URL) (. text))) (.group 1)))
(setv ADDRESS (+ URL "th?id=" NAME))
(with [FILE (open (os.path.join (os.getcwd) "wallpapers" NAME) "wb")] (.write FILE (-> (requests.get ADDRESS) (. content))))
```
