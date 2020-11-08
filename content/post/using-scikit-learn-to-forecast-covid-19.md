+++
title = "Using scikit-learn to Forecast COVID-19"
date = 2020-11-08T19:19:00+08:00
lastmod = 2021-08-15T19:37:11+08:00
tags = ["Python", "COVID-19"]
categories = ["技术"]
draft = false
+++

之前介绍过利用 ARIMA 来预测 COVID-19 的方法[^1]，精度比较高，在上次的预测中，R2 达到 0.9707434150898225。这次尝试使用机器学习的思路来预测 COVID-19。
[^1]: [Using ARIMA to Forecast COVID-19]({{< relref "using-arima-to-forecast-covid-19" >}})

<!--more-->


## 数据获取与清洗 {#数据获取与清洗}

同样还是使用 [CSSEGISandData/COVID-19](https://github.com/CSSEGISandData/COVID-19) 的数据。

```python
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.ensemble import AdaBoostRegressor, RandomForestRegressor
from sklearn.linear_model import ElasticNet, LassoCV, LinearRegression, RidgeCV
from lightgbm import LGBMRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVR

# 读取网页，提取数据
df = pd.read_csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv')
df = df.iloc[:, 4:]                               # 从第4列开始读取，弃掉经纬度等信息
df.loc['y'] = df.apply(lambda x: x.sum())         # 新增一行全球累计数据，并按列求和
df = df.iloc[-1:, :].T                            # 提取最后一行，全部列，即全球累计这一行，并转置行列
df.index = pd.DatetimeIndex(df.index)             # 将索引转换为时间序列
df = df.diff().dropna()                           # 计算一阶差分，获得每日新增数量
```


## 数据探索与分割 {#数据探索与分割}

先定义两个函数：

```python
def timeseries_split(X, y, test_size, pred_size):
    # 将数据分割成训练集、测试集，并根据需要预测的天数准备预测集
    test_index = int(len(X) * (1 - test_size))

    X_train = X.iloc[:test_index]
    y_train = y.iloc[:test_index]
    X_test = X.iloc[test_index:len(X) - pred_size]
    y_test = y.iloc[test_index:len(X) - pred_size]
    X_pred = X.iloc[-pred_size:]
    y_pred = y.iloc[-pred_size:]

    return X_train, y_train, X_test, y_test, X_pred, y_pred


def prepare_data(data,
                 lag_start,
                 lag_end,
                 test_size,
                 target_encoding=False,
                 pred_days=7):
    # 用来产生特征数据，其中：
    # lag_start与lag_end：平移特征的范围（可调整优化），test_size：测试集占比
    # target_encoding：是否要开启均值特征，pred_days：预测多少天
    last_day = data.index.max()
    pred_day = pd.date_range(start=last_day,
                             periods=pred_days + 1,
                             freq='1d')
    pred_day = pred_day[pred_day > last_day]
    future_data = pd.DataFrame({
        'time': pred_day,
        'y': np.zeros(len(pred_day))
    })
    future_data.set_index('time', drop=True, inplace=True)
    data = pd.concat([data, future_data])

    for i in range(lag_start, lag_end):
        data['lag_{}'.format(i)] = data.y.shift(i)

    data['diff_lag_{}'.format(lag_start)] = data['lag_{}'.format(
        lag_start)].diff(1)
    data['day'] = data.index.day
    data['weekday'] = data.index.weekday
    data['is_weekend'] = data.weekday.isin([5, 6]) * 1

    if target_encoding:
        test_index = int(len(data) * (1 - test_size))
        data['weekday_avg'] = list(
            map(
                dict(data[:test_index].groupby('weekday')['y'].mean()).get,
                data.weekday))

        data.drop(['day', 'weekday', 'is_weekend'], axis=1, inplace=True)

    data = data.fillna(0)
    y = data.dropna().y
    X = data.dropna().drop(['y'], axis=1)
    X_train, y_train, X_test, y_test, X_pred, y_pred = timeseries_split(
        X, y, test_size, pred_days)

    return X_train, y_train, X_test, y_test, X_pred, y_pred
```

对数据做分割：

```python
# 平移特征范围
LAG_START=1
LAG_END=14
# 将数据按照7:3分割成训练集和测试集，并分配一个30天预测集。
X_train, y_train, X_test, y_test, X_pred, y_pred = prepare_data(df, LAG_START, LAG_END, .3, True, 30)

# 将训练数据标准化
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)
```


## 模型训练与对比 {#模型训练与对比}

```python
# 准备各类模型，这里全部模型都用默认参数
models = {
    'LassoCV': LassoCV(),
    'LinearRegression': LinearRegression(),
    'RidgeCV': RidgeCV(),
    'ElasticNet': ElasticNet(),
    'RandomForestRegressor': RandomForestRegressor(),
    'AdaBoostRegressor': AdaBoostRegressor(),
    'LGBMRegressor': LGBMRegressor(),
}
names = list(models.keys())

# 作图
fig, ax = plt.subplots(len(models),
                       1,
                       sharex='col',
                       sharey='row',
                       figsize=(8, 14))

for i in range(len(models)):
    model = models[names[i]]
    model.fit(X_train, y_train)
    y_fit = model.predict(X_test)

    fit = pd.DataFrame(y_fit)
    fit.index = pd.DatetimeIndex(y_test.index)
    ax[i].plot(y_test)
    ax[i].plot(fit)
    ax[i].set_title('{}, R2={}'.format(names[i], r2_score(y_test, y_fit)))

plt.tight_layout()
plt.savefig('models.png', bbox_inches='tight', dpi=300)
plt.show()
```

{{< figure src="/ox-hugo/models.png" >}}


## 数据分析与预测 {#数据分析与预测}

从上图中对比分析，采用 LinearRegression 模型的 R2 值最高，因此暂定采用它来做预测。

```python
def predict_future(model, scaler, x_pred, y_pred, lag_start, lag_end):
    # 用来预测将来的数据，其中：
    # model：拟合的模型，scaler：标准化
    # lag_start/end：平移特征的范围，x_pred/y_pred：预测x和y
    y_pred[0:lag_start] = model.predict(scaler.transform(x_pred[0:lag_start]))
    # 预测到lag_start上一行

    for i in range(lag_start, len(x_pred)):
        last_line = x_pred.iloc[i - 1]
        # 已经预测数据的最后一行，还没预测数据的上一行，即shift上一行填充到斜角下一行
        index = x_pred.index[i]
        x_pred.at[index, 'lag_{}'.format(lag_start)] = y_pred[i - 1]
        x_pred.at[index, 'diff_lag_{}'.format(lag_start)] = \
            y_pred[i - 1] - x_pred.at[x_pred.index[i - 1], 'lag_{}'.format(lag_start)]
        for j in range(lag_start + 1, lag_end):
            # 根据平移变换shift，前一个lag_{}列的值，shift后为下一个列的值
            x_pred.at[index, 'lag_{}'.format(j)] = last_line['lag_{}'.format(j - 1)]
            y_pred[i] = model.predict(scaler.transform([x_pred.iloc[i]]))[0]

    return y_pred

# lag_start/end与前面一致
y_future = predict_future(model, scaler, X_pred, y_pred, LAG_START, LAG_END)
```

{{< figure src="/ox-hugo/scikit-forecast.png" >}}


## 优化特征与模型 {#优化特征与模型}

从上述 R2 值看到为 0.8822414801778371，还有可以提升的空间。可以从以下两方面入手优化：


### 调整数据特征 {#调整数据特征}

改变 `lag_start/end` 的范围，使用不同的特征。


### 调整模型参数 {#调整模型参数}

改变模型的参数组合。可以使用 `GridSearchCV` 与 `RandomizedSearchCV` 调参。


### 使用融合模型 {#使用融合模型}

使用多个的模型做组合预测。可以使用 `bagging` 、 `boosting` 、 `stacking` 等组合模型。
