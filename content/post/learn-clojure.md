+++
title = "Learn Clojure"
date = 2020-01-14T12:53:00+08:00
lastmod = 2022-05-02T11:13:31+08:00
tags = ["emacs", "clojure"]
categories = ["技术"]
draft = false
+++

clojure 是一门函数式编程语言。学习 clojure 其实是出于贪心——相当于一次性学 java 和 lisp。 <br/>

我采用的环境是 Windows 和 linux，编辑器是 emacs(spacemacs)。 <br/>

<!--more-->


## 配置环境 {#配置环境}


### 安装 {#安装}

-   jdk <br/>
-   clojure <br/>
-   leiningen <br/>


### 配置 {#配置}

编辑 ~/.spacemacs.d/init.el，启用 cider[^1]。 <br/>
[^1]: sayid 是 debugger 工具，clj-refactor 是 refactor 工具，clj-kondo 是 linter 工具，视情况是否启用。 <br/>

```text
    (clojure :variables
        clojure-enable-sayid t
        clojure-enable-clj-refactor t
        clojure-enable-fancify-symbols t
        clojure-enable-linters 'clj-kondo)
```


### 使用 {#使用}

1.  创建 <br/>

    用 `lein` 生成工程，会以工程名成生成一个目录，在其下自动生成一些文件，其中工程配置在 `project.clj`​，源代码在 `src/[name]/core.clj`​，测试代码在 `test/[name]/core_test.clj`​。 <br/>

    ```shell
       lein new [模板名称] 工程名称
    ```

    本例子中，采用 `app` 模板自动生成，便于后续打包。如有需要，使用 `lein deps` 下载相关依赖包。 <br/>

2.  编辑 <br/>

    编写 `core.clj` 如下： <br/>

    ```clojure
       (ns hello.core)

       (defn hello [s1,s2]
         (let [s (str s1 " " s2)]
           (str "Greeting, " s "!")))

       (hello "dog" "cat")
    ```

    其中命名空间由 `refactor` 自动生成。 <br/>
3.  运行 <br/>

    启用 `cider` <br/>

    -   直接使用 `C-c C-s C-s` 或 `, '` 启用 `cider-jack-in-*`​。 <br/>
    -   也可以先在终端下开启 `lein repl` ，再使用 `C-c C-s C-s` 或 `, '` 启用 `cider-connect-in-*`​。 <br/>

    然后可以在代码的表达式上按 `C-c C-c` 或 `, e f` 执行，同时可以看到结果。 <br/>

    也可以在选择一段表达式后按 `C-c C-e` 或 `, e r` 执行，可以看到此部分代码的执行结果。 <br/>
4.  调试 <br/>

    在函数定义表达式上按 `C-u C-c C-c` 或 `, d b`​，进入 debug 模式，此时函数名带红框标记。 <br/>

    在函数调用表达式上按 `C-c C-c` 或 `, e f`​，出现 debug 菜单，进行调试。 <br/>

    在函数定义表达式上按 `C-c C-c` 或 `, e f`​，退出 debug 模式。 <br/>
5.  测试 <br/>

    编写 `core_test.clj` 如下: <br/>

    ```clojure
       (ns hello.core-test
         (:require [hello.core :as sut]
                   [clojure.test :as t]))

       (t/deftest test-hello
         (t/testing "test"
           (t/is (= "Greeting, Cat Dog!"
                    (sut/hello "cat" "dog")))))
    ```

    使用 `C-c C-k` 或 `, s b`​，将测试文件执行一次。 <br/>

    然后用 `C-c C-t C-t` 或 `C-c , t` 执行测试。 <br/>

    本例中报错如下： <br/>

    ```text
       Test Summary
       hello.core-test

       Tested 1 namespaces
       Ran 1 assertions, in 1 test functions
       1 failures

       Results

       hello.core-test
       1 non-passing tests:

       Fail in test-hello
       test

       expected: "Greeting, Cat Dog!"

         actual: "Greeting, cat dog!"
           diff: - "Greeting, Cat Dog!"
    ​             + "Greeting, cat dog!"
    ```

    修改源代码 `core.clj` 如下： <br/>

    ```clojure
       (ns hello.core
         (:require [clojure.string :as str]))

       (defn hello [s1,s2]
         (let [s (str (str/capitalize s1) " " (str/capitalize s2))]
           (str "Greeting, " s "!")))
    ```

    再次执行测试，测试通过。 <br/>

    ```text
       Test Summary
       hello.core-test

       Tested 1 namespaces
       Ran 1 assertions, in 1 test functions
       1 passed
    ```
6.  打包 <br/>

    要在外部运行，需要确保有 `-main` 函数，同时在命名空间里有 `(:gen-class)`​。 <br/>

    ```clojure
       (ns hello.core
         (:require [clojure.string :as str])
         (:gen-class))   ;; <======

       (defn hello [s1,s2]
         (let [s (str (str/capitalize s1) " " (str/capitalize s2))]
           (str "Greeting, " s "!")))

       (defn -main []    ;; <======
         (println (hello "dog" "cat")))
    ```

    然后在 `project.clj` 中需要有 `main` 声明。 <br/>

    ```clojure
       (defproject hello "0.1.0-SNAPSHOT"
         ...
         :dependencies [[org.clojure/clojure "1.10.1"]]
         :repl-options {:init-ns hello.core}
         :main hello.core)  ;; <======
    ```

    以上两步在用 `lein new app NAME` 的时候会自动生成。 <br/>

    用 `lein run` 可以检查运行结果。用 `lein uberjar` 编译成 jar 文件，之后就可以用 java 执行了。 <br/>

    ```text
       java -jar ./target/hello-0.1.0-SNAPSHOT-standalone.jar
    ```


## 基础语法 {#基础语法}


### 形式 {#形式}

Clojure 代码由一个个 form 组成， 即写在小括号里的由空格分开的一组语句。 <br/>

Clojure 代码的第一条语句一般是用 ns 来指定当前的命名空间： <br/>

```clojure
(ns learnclojure)
```

Clojure 解释器会把第一个元素当做一个函数或者宏来调用，其余的被认为是参数。如： <br/>

```clojure
(str "Hello" " " "World")
;; => "Hello World"
```


### 数据类型 {#数据类型}

Clojure 使用 java 的 Object 来描述布尔值、字符串和数字。 <br/>
用函数 class 来查看具体的类型。 <br/>


### 数据结构 {#数据结构}


#### 基本类型 {#基本类型}

<!--list-separator-->

-  列表（list）

    以单引号加园括号，避免求值。或者用（quote())的形式。 <br/>
    '(a b c) <br/>

<!--list-separator-->

-  向量（vector）

    用方括号。 <br/>
    [a b c] <br/>

<!--list-separator-->

-  哈希表（hash）

    用大括号的键-值对。键以冒号打头。 <br/>
    {:a 1 :b 2} <br/>

<!--list-separator-->

-  集合（set）

    用#加大括号。值唯一。 <br/>
    \#{a b c} <br/>


#### 基本操作 {#基本操作}

<!--list-separator-->

-  filter

    filter 函数是函数式编程中对集合操作的三大重要操作之一。其作用是筛选出满足条件的元素组成一个新的集合返回。 <br/>

    filter 函数需要两个参数，第一个是过滤函数，用于检查元素是否符合，第二个是集合本身。结果返回一个 list。 <br/>

    ```clojure
    (def stooges ["Moe" "Larry" "Curly" "Shemp"])
    (filter #(> (count %) 3) stooges)
    ;; => ("Larry" "Curly" "Shemp")
    ```

    上面代码中的 count 函数是计算字符串的长度，#(&gt; (count %) 3) 是个匿名函数，只有长度大于 3 的字符串才满足条件。 <br/>

    ```clojure
    (def years [1940 1944 1961 1985 1987])
    (filter #(even? %) years)
    ;; => (1940 1944)
    ```

    上面代码是取出偶数年代值。 <br/>

<!--list-separator-->

-  map

    map 函数是函数式编程中对集合操作的三大重要操作之一。其作用是对集合中的每一个元素做处理，最后得到一个新的集合（注意集合类型是列表），新集合的元素个数和原集合一样，但内容可以不一样（包括元素的类型）。 <br/>

    所以 map 函数 的第一个参数是对元素转换的处理函数，后面的参数是待处理的集合（一个或多个）。 <br/>

    ```clojure
    (defn fun [item] (* item 2))
    (map fun [1 2 3])
    ;; => (2 4 6)
    ```

    可以看出，被处理的集合是 vector，但处理后返回的集合类型为 list。 <br/>

    ```clojure
    (map fun #{1 2 3})
    ;; => (2 6 4)
    ```

    可以看出 set 被处理后返回的集合类型也是列表，而且因为 set 本身是无序的，返回的 list 结果序号与 set 表面上看的也不一致。 <br/>

    ```clojure
    (map + [2 4] [5 6] [1 2])
    ;; => (8 12)
    (map + [2 4 7] [5 6] [1 2 3 4])
    ;; => (8 12)
    ```

    上面两个例子传入的第一个参数是函数是 + ， 后面是多个集合。最后的结果是按照最小的集合元素算的。 <br/>

    ```clojure
    (map #(* % 2) [1 2 3])
    ;; => (2 4 6)
    ```

    上面代码中传给 map 的是一个匿名函数 #(\* % 2) 。在实际的集合 map 操作中，大量场景下会传入匿名函数。 <br/>

<!--list-separator-->

-  reduce

    reduce 函数是函数式编程中对集合操作的三大重要操作之一。其作用是对集合做处理，得到一个计算后的值。如 sum, count, max, min 都是 reduce 操作的特例，只不过这些操作是非常常见和通用的，会被提为专门的方法。 <br/>

    ```clojure
    (reduce #(+ %1 %2) [1 2 3])
    ;; => 6
    ```

    上面操作是对集合求和。reduce 的第一个参数是一个函数，这里是匿名函数，该匿名第一个参数(用 1%代替)是每次迭代的返回值，%2 是元素。每次对元素操作，1%都会重新最后作为参数传入，最后一个元素处理完后%1 的值会作为 reduce 的函数值返回。 <br/>

    ```clojure
    (reduce #(* %1 %2) [2 4 6])
    ;; => 48
    ```

    上面操作是对集合中的元素求乘积。 <br/>

    ```clojure
    (reduce #(if (> %1 %2) %1 %2) [10 2 54 3 6])
    ;; => 54
    (reduce #(if (< %1 %2) %1 %2) [10 2 54 3 6])
    ;; => 2
    ```

    上面的两个操作分别是取最大值和最小值。 <br/>


### 函数 {#函数}


#### 一般函数 {#一般函数}

函数定义本身也是一个表达式，调用宏 defn 定义，也是放到 () 中，其函数体也是由 1 个或多个表达式组成。 <br/>

**语法： (defn 函数名 [参数列表] 表达式 1  表达式 2 .... 表达式 n)** <br/>

上面定义返回的是一个函数。 <br/>

函数调用 <br/>

**语法： (函数名 表达式 1  表达式 2 .... 表达式 n)** <br/>

上面的表达式就是传递给函数的参数值。 <br/>

在 Clojure 中，函数既可以直接被调用，用()调用。 也可以作为参数传递给函数，也可以作为函数执行的返回值。 <br/>

```clojure
(defn hello[a b] (+ a b))
(hello 3 4)
;; => 7
```


#### 匿名函数 {#匿名函数}

定义匿名函数的语法是： **#(表达式)** <br/>

传入的参数用 % 占位符来标记。 <br/>

其中 % 表示唯一的参数；%1、%2 ..依次表示第 1、2、..个参数；%&amp; 表示所有参数。 <br/>

```clojure
(#(+ %1 %2) 10 20)
;; => 30
```

总结： <br/>

```text
     () 是函数调用，第一个值是函数名，后续值是参数。返回的是函数执行的结果。
     '() 是列表（list）。
     #() 是匿名函数，返回的是一个函数。不是函数调用。
     #{} 是集合（set）。
```