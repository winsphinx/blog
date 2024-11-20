+++
title = "掩耳盗铃"
date = 2024-11-20T15:15:00+08:00
lastmod = 2025-02-20T18:53:49+08:00
tags = ["linux", "Windows"]
categories = ["技术"]
draft = false
+++

秋去冬来，又到了上级检查组出没的季节。检查项目中有一项是各种系统日志的备份记录，为了应付检查就得无中生有给变出来。按照要求是每天一个文件夹，里面是当天的日志。如果手工复制文件再修改日期，肯定得累死。于是在 linux 和 windows 的电脑上分别用 bash 和 powershell 编了脚本来实现。 <br/>

<!--more-->


## linux bash {#linux-bash}

脚本如下： <br/>

```shell
#!/bin/bash

# 设置起始和结束日期
start_date="20240101"
end_date="20241031"

# 将日期转换为时间戳
start_ts=$(date -d "$start_date" +%s)
end_ts=$(date -d "$end_date" +%s)

# 开始循环，来生成目录和文件
current_ts=$start_ts
while [ $current_ts -le $end_ts ]; do
    # 获取当前日期
    current_date=$(date -d "@$current_ts" +%Y%m%d)

    # 创建目录
    mkdir -p "$current_date"

    # 设置文件名和时间戳，对应在每天的00:10:18
    timestamp="${current_date}001018"
    file1="${timestamp}-operation-log-dateThreshold_info.xml"
    file2="${timestamp}-operation-log-dateThreshold.zip"
    file3="${timestamp}-system-log-dateThreshold_info.xml"
    file4="${timestamp}-system-log-dateThreshold.zip"

    # 创建文件并填充随机内容，文件大小也用随机数生成范围
    head -c $((RANDOM % 101 + 700)) /dev/urandom > "$current_date/$file1"
    head -c $((RANDOM % 10001 + 40000)) /dev/urandom > "$current_date/$file2"
    head -c $((RANDOM % 101 + 700)) /dev/urandom > "$current_date/$file3"
    head -c $((RANDOM % 1001 + 3000)) /dev/urandom > "$current_date/$file4"

    # 将文件生成时间戳修改为指定时间
    touch -d "${current_date} 00:10:18" "$current_date/$file1"
    touch -d "${current_date} 00:10:18" "$current_date/$file2"
    touch -d "${current_date} 00:10:18" "$current_date/$file3"
    touch -d "${current_date} 00:10:18" "$current_date/$file4"

    # 目录的时间戳也不要忘记设置
    touch -d "${current_date} 00:10:18" "$current_date"

    # 循环移动到下一个日期继续
    current_ts=$(($current_ts + 86400))
done
```


## Windows PowerShell {#windows-powershell}

脚本如下： <br/>

```shell
# 设置起始和结束日期
$start_date = "20240101"
$end_date = "20241031"

# 将日期转换为时间戳
$start_ts = [datetime]::ParseExact($start_date, "yyyyMMdd", $null).ToFileTimeUtc()
$end_ts = [datetime]::ParseExact($end_date, "yyyyMMdd", $null).ToFileTimeUtc()

# 开始循环，来生成目录和文件
$current_ts = $start_ts
while ($current_ts -le $end_ts) {
    # 获取当前日期
    $current_date = [datetime]::FromFileTimeUtc($current_ts).ToString("yyyyMMdd")

    # 创建目录
    New-Item -ItemType Directory -Path $current_date -Force

    # 设置文件名和时间戳，对应在每天的00:10:18
    $timestamp = "${current_date}001018"
    $file1 = "${timestamp}-operation-log-dateThreshold_info.xml"
    $file2 = "${timestamp}-operation-log-dateThreshold.zip"
    $file3 = "${timestamp}-system-log-dateThreshold_info.xml"
    $file4 = "${timestamp}-system-log-dateThreshold.zip"

    # 创建文件并填充随机内容，文件大小也用随机数生成范围
    $random = New-Object System.Random
    $file1_size = $random.Next(700, 800)
    $file2_size = $random.Next(40000, 50000)
    $file3_size = $random.Next(700, 800)
    $file4_size = $random.Next(3000, 4000)

    $file1_content = [byte[]]::new($file1_size)
    $file2_content = [byte[]]::new($file2_size)
    $file3_content = [byte[]]::new($file3_size)
    $file4_content = [byte[]]::new($file4_size)

    $random.NextBytes($file1_content)
    $random.NextBytes($file2_content)
    $random.NextBytes($file3_content)
    $random.NextBytes($file4_content)

    [System.IO.File]::WriteAllBytes("$current_date\$file1", $file1_content)
    [System.IO.File]::WriteAllBytes("$current_date\$file2", $file2_content)
    [System.IO.File]::WriteAllBytes("$current_date\$file3", $file3_content)
    [System.IO.File]::WriteAllBytes("$current_date\$file4", $file4_content)

    # 将文件生成时间戳修改为指定时间
    $timestamp_date = [datetime]::ParseExact("${current_date} 00:10:18", "yyyyMMdd HH:mm:ss", $null)
    (Get-Item "$current_date\$file1").LastWriteTime = $timestamp_date
    (Get-Item "$current_date\$file2").LastWriteTime = $timestamp_date
    (Get-Item "$current_date\$file3").LastWriteTime = $timestamp_date
    (Get-Item "$current_date\$file4").LastWriteTime = $timestamp_date

    # 目录的时间戳也不要忘记设置
    (Get-Item $current_date).LastWriteTime = $timestamp_date

    # 循环移动到下一个日期继续
    $current_ts += 864000000000 # 增加一天的时间戳（单位为100纳秒）
}
```

写完程序，突然发现，古往今来，掩耳盗铃之事从未停止过。 <br/>

