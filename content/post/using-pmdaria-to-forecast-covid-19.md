+++
title = "Using pmdaria to Forecast COVID-19"
date = 2021-04-06T19:38:00+08:00
lastmod = 2021-05-07T18:55:26+08:00
tags = ["Python", "COVID-19"]
categories = ["技术"]
draft = false
+++

之前写过两篇[^1][^2]预测 COVID-19 的方法，这次用个“偷懒”的办法，直接采用 pmdaria 来自动调整参数，用来预测分析。
[^1]: [Using ARIMA to Forecast COVID-19]({{< relref "using-arima-to-forecast-covid-19" >}})
[^2]: [Using scikit-learn to Forecast COVID-19]({{< relref "using-scikit-learn-to-forecast-covid-19" >}})

这次的特色是，利用 Github Actions 来定时自动运行脚本，达到[每日更新](https://github.com/winsphinx/covid)的目的。

<!--more-->


## 首先是 Python 脚本 {#首先是-python-脚本}

Python 脚本总体思路是，从网上获取数据，再利用 pmdarima 自动选择参数并作出预测，最后利用 matplotlib 生成预测的图像。

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import codecs
import os
import re
from concurrent.futures import ProcessPoolExecutor

import matplotlib.pyplot as plt
import pandas as pd
from pmdarima import arima
from pmdarima.model_selection import train_test_split
from sklearn.metrics import r2_score


def adjust_date(s):
    t = s.split("/")
    return f"20{t[2]}-{int(t[0]):02d}-{int(t[1]):02d}"


def adjust_name(s):
    return re.sub(r"\*|\,|\(|\)|\*|\ |\'", "_", s)


def draw(country):
    draw_(country, True)
    draw_(country, False)


def draw_(country, isDaily):
    # 模型训练
    model = arima.AutoARIMA(
        start_p=0,
        max_p=4,
        d=None,
        start_q=0,
        max_q=1,
        start_P=0,
        max_P=1,
        D=None,
        start_Q=0,
        max_Q=1,
        m=7,
        seasonal=True,
        test="kpss",
        trace=True,
        error_action="ignore",
        suppress_warnings=True,
        stepwise=True,
    )
    if isDaily:
        data = df[country].diff().dropna()
        model.fit(data)
    else:
        data = df[country]
        model.fit(data)

    # 模型验证
    train, test = train_test_split(data, train_size=0.8)
    pred_test = model.predict_in_sample(start=train.shape[0], dynamic=False)
    validating = pd.Series(pred_test, index=test.index)
    r2 = r2_score(test, pred_test)

    # 开始预测
    pred, pred_ci = model.predict(n_periods=14, return_conf_int=True)
    idx = pd.date_range(data.index.max() + pd.Timedelta("1D"), periods=14, freq="D")
    forecasting = pd.Series(pred, index=idx)

    # 绘图呈现
    plt.figure(figsize=(15, 6))

    plt.plot(data.index, data, label="Actual Value", color="blue")
    plt.plot(validating.index, validating, label="Check Value", color="orange")
    plt.plot(forecasting.index, forecasting, label="Predict Value", color="red")
    # plt.fill_between(forecasting.index, pred_ci[:, 0], pred_ci[:, 1], color="black", alpha=.25)

    plt.legend()
    plt.ticklabel_format(style="plain", axis="y")
    # plt.rcParams["font.sans-serif"] = ["Microsoft YaHei"]
    if isDaily:
        plt.title(
            f"Daily Confirmed Cases Forecasting - {country}\nARIMA {model.model_.order}x{model.model_.seasonal_order} (R2 = {r2:.6f})"
        )
        plt.savefig(
            os.path.join("figures", f"covid-{adjust_name(country)}-daily.svg"),
            bbox_inches="tight",
        )
        plt.close()
    else:
        plt.title(
            f"Accumulative Confirmed Cases Forecasting - {country}\nARIMA {model.model_.order}x{model.model_.seasonal_order} (R2 = {r2:.6f})"
        )
        plt.savefig(
            os.path.join("figures", f"covid-{adjust_name(country)}.svg"),
            bbox_inches="tight",
        )
        plt.close()


if __name__ == "__main__":
    # 准备数据
    df = (
        pd.read_csv(
            "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv"
        )
        .drop(columns=["Lat", "Long"])
        .groupby("Country/Region")
        .sum()
        .transpose()
    )
    df.index = pd.DatetimeIndex(df.index.map(adjust_date))

    countries = df.columns.to_list()

    # 线程池
    with ProcessPoolExecutor() as pool:
        pool.map(draw, countries)
    pool.shutdown(wait=True)

    # 编制索引
    with codecs.open("README.md", "w", "utf-8") as f:
        f.write(
            "[![check status](https://github.com/winsphinx/covid/actions/workflows/check.yml/badge.svg)](https://github.com/winsphinx/covid/actions/workflows/check.yml)\n"
        )
        f.write(
            "[![build status](https://github.com/winsphinx/covid/actions/workflows/build.yml/badge.svg)](https://github.com/winsphinx/covid/actions/workflows/build.yml)\n"
        )
        f.write("# COVID-19 Forecasting\n\n")
        for country in countries:
            f.write(f"## {country}\n\n")
            f.write(f"![img](figures/covid-{adjust_name(country)}.svg)\n\n")
            f.write(f"![img](figures/covid-{adjust_name(country)}-daily.svg)\n\n")
```


## 然后是 Github Actions 脚本 {#然后是-github-actions-脚本}

Github Actions 可以根据预先设定的各种条件来触发，如定时触发、push、pull requset 时触发、手动触发等。

然后可以按顺序定义一系列的操作步骤，如本脚本的步骤就是先是拉取（pull）仓库，再是运行 Python 脚本生成数据，然后再递交（commit）、推送（push）回去。

```yaml
name: build status

on:
  workflow_dispatch: # 加入这个触发器，可以用来按需手工运行
  schedule:
    - cron: "30 */12 * * *" # 按计划在每天0:30、12:30运行

jobs:
  build:

    runs-on: windows-latest

    steps:
    - name: Set up Git repository
      uses: actions/checkout@v2
      with:
        persist-credentials: false # otherwise, the token used is the GITHUB_TOKEN, instead of your personal token
        fetch-depth: 0 # otherwise, you will failed to push refs to dest repo

    - name: Set up Python
      uses: actions/setup-python@v2

    - name: Create local files
      run: |
        python -m pip install --upgrade pip
        pip install -U matplotlib pandas pmdarima scikit_learn
        python covid.py

    - name: Commit files
      run: |
        git config --local user.email "github-actions[bot]@users.noreply.github.com"
        git config --local user.name "github-actions[bot]"
        git add .
        git commit -m "Auto Update"

    - name: Push changes
      uses: ad-m/github-push-action@master
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        branch: ${{ github.ref }}
```
