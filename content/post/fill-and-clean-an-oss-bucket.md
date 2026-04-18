+++
title = "Fill and Clean an OSS Bucket"
date = 2026-03-14T14:16:00+08:00
lastmod = 2026-04-18T14:56:28+08:00
tags = ["linux", "Python"]
categories = ["技术"]
draft = false
+++

应某种特殊的要求，要快速在 OSS Bucket[^1] 中填充 600T 的数据。解决方案记录如下： <br/>

[^1]: 业务涉及的是 CUCloud，大体与 S3 类似，但细节略有差异，后续涉及差异处详细说明。 <br/>

<!--more-->


## 准备工作 {#准备工作}


### 创建 bucket {#创建-bucket}

登录云端，创建 bucket，此处命名为 test。同时也要创建 credentials，获取 `aws_access_key_id` 和 `aws_secret_access_key` 两个凭据。 <br/>


### 配置 aws {#配置-aws}

运行 `aws configure`, 然后： <br/>

-   输入 `aws_access_key_id` 和 `aws_secret_access_key` <br/>
-   配置区域 <br/>
-   设置输出格式为 json <br/>


## 填充 {#填充}

如何直接上传 600T 的数据，经简单计算需要近一个月的时间，而且也会消耗大量的流量，因此需要更好的方案。我的总体思路是，先上传一个种子文件，然后在 bucket 内部复制，实习“裂变”，实际操作 2 天半时间就完成了任务。 <br/>


### 上传种子 {#上传种子}

```shell
dd if=/dev/zero bs=1M count=10240 status=progress | aws s3 cp - s3://test/seed_10G.img --endpoint-url https://obs-xxxx.cucloud.cn --no-verify-ssl
```

此处，由于 CUCloud 不支持通配符，但 endpoint-url 又不支持 http，因此不得不加上 `--no-verify-ssl`​。 <br/>


### 分裂种子 {#分裂种子}

```shell
seq 1 60000 | xargs -P 20 -I {} aws s3 cp s3://test/seed_10G.img s3://test/copy_{}.img --endpoint-url https://obs-xxxx.cucloud.cn --no-verify-ssl 2>/dev/null
```

可以先不加 `2>/dev/null` 观察一会，确认无误后再加，避免刷屏。 <br/>


## 清理 {#清理}

一段时间后风头已过，需要清理无效数据，操作如下： <br/>

```shell
aws s3 rm s3://test/copy_ --recursive  --endpoint-url https://obs-xxxx.cucloud.cn  --no-verify-ssl
```

通过命令检查： <br/>

```shell
aws s3 ls s3://test/copy_ --recursive  --endpoint-url https://obs-xxxx.cucloud.cn  --no-verify-ssl
```

也确实没有文件了，但奇怪的是 bucket 还是不能删除。查了一些资料后，说是是有版本控制，即其内部有文件的历史版本或删除标记，导致 bucket 实际非空。它介绍用 s3api 来处理： <br/>

```shell
aws s3api list-object-versions --bucket test --endpoint-url https://obs-xxxx.cucloud.cn --no-verify-ssl --query '{Objects: [Versions[], DeleteMarkers[] | {Key: Key, VersionId: VersionId}]}' > delete.json
aws s3api delete-objects --bucket test --delete file://delete.json --endpoint-url https://obs-xxxx.cucloud.cn --no-verify-ssl
```

但经操作还是无法删除，最终不得不祭出 Python 大法： <br/>

```python
import boto3
from botocore.client import Config

# 1. 抑制 urllib3 的 InsecureRequestWarning
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 配置参数
ENDPOINT = "https://obs-xxxx.cucloud.cn"
BUCKET_NAME = "test"
ACCESS_KEY = "ACCESS_KEY"
SECRET_KEY = "SECRET_KEY"

# 初始化 S3 客户端
s3 = boto3.client(
    's3',
    endpoint_url=ENDPOINT,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    verify=False,
    config=Config(signature_version='s3v4')
)

def force_empty_and_delete_bucket(bucket_name):
    print(f"--- 开始清空存储桶: {bucket_name} ---")

    # 计数器
    count = 0

    try:
        # 使用分页器获取所有版本，处理大容量 Bucket
        paginator = s3.get_paginator('list_object_versions')
        for page in paginator.paginate(Bucket=bucket_name):

            # 处理普通版本和历史版本
            versions = page.get('Versions', [])
            for v in versions:
                key = v['Key']
                vid = v['VersionId']
                print(f"[删除版本] {key} (ID: {vid})")
                s3.delete_object(Bucket=bucket_name, Key=key, VersionId=vid)
                count += 1

            # 处理删除标记
            markers = page.get('DeleteMarkers', [])
            for m in markers:
                key = m['Key']
                vid = m['VersionId']
                print(f"[清理标记] {key} (ID: {vid})")
                s3.delete_object(Bucket=bucket_name, Key=key, VersionId=vid)
                count += 1

        # 清理未完成的分段上传碎片
        print("正在检查未完成的分段上传碎片...")
        uploads = s3.list_multipart_uploads(Bucket=bucket_name)
        for u in uploads.get('Uploads', []):
            print(f"[中止碎片] {u['Key']}")
            s3.abort_multipart_upload(Bucket=bucket_name, Key=u['Key'], UploadId=u['UploadId'])

        print(f"--- 清理完成，共处理 {count} 个条目 ---")

        # 尝试删除存储桶
        try:
            s3.delete_bucket(Bucket=bucket_name)
            print(f"SUCCESS: 存储桶 {bucket_name} 已成功销毁。")
        except Exception as e:
            print(f"ERROR: 桶已清空但无法删除，可能是权限或延迟: {e}")

    except Exception as e:
        print(f"CRITICAL ERROR: {e}")

if __name__ == "__main__":
    force_empty_and_delete_bucket(BUCKET_NAME)
```

至此，Mission Completed! <br/>

