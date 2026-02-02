# 本地 AI 模型配置指南

您已将讯飞星辰 MaaS 平台的微调模型下载到了本地 (`train_output.zip`)。
为了让 AI 助手使用这个本地模型，您需要运行一个本地 Python 推理服务。

## 前置要求

1.  **Python 环境**: 安装 Python 3.10 或更高版本。
2.  **硬件要求**: 
    *   **显存 (VRAM)**: 至少 16GB (推荐 24GB+)，因为这是 7B 参数的模型。
    *   或者 **内存 (RAM)**: 32GB+ (仅使用 CPU 推理，速度较慢)。
3.  **网络**: 需要连接 Hugging Face 或腾讯云以下载基础模型 (HunYuan-MT-7B)。

## 安装步骤

1.  打开终端，进入 `local_model` 目录：
    ```powershell
    cd local_model
    ```

2.  安装依赖库：
    ```powershell
    pip install -r requirements.txt
    ```
    *(如果没有 NVIDIA 显卡，请参考 PyTorch 官网安装 CPU 版本)*

## 运行模型

1.  启动本地服务：
    ```powershell
    python server.py
    ```
    *首次运行时，它会自动解压 `train_output.zip` 并尝试下载基础模型，这可能需要很长时间。*

2.  开启本地模式开关：
    *   在 Windows 环境变量中添加 `USE_LOCAL_MODEL=true`
    *   或者在启动项目时设置：
        ```powershell
        $env:USE_LOCAL_MODEL="true"; npm start
        ```

## ⚠️ 注意事项

由于本地运行大模型对硬件要求极高，如果您的电脑配置不足或启动失败，**建议继续使用云端 API 模式**。
目前的云端配置（默认）已经连接到了您在讯飞星辰平台上训练好的同一个模型 (`xopf6a4d241`)，速度更快且无需占用本地资源。
