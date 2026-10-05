---
title: 'YOLO 入门：理解目标检测，并用 Python 完成第一次图片识别'
summary: '从分类、检测与分割的区别讲起，理解 YOLO 的检测框、置信度和评估指标，再用预训练模型运行图片检测。'
date: '2026-10-05'
section: coding
type: article
tags: [Python, YOLO, 深度学习, 计算机视觉]
featured: false
draft: false
---

## YOLO 要解决什么问题

给计算机一张街景照片，可以提出不同的问题：整张图片里有没有公交车？公交车具体在哪里？属于公交车的像素有哪些？它们分别接近图像分类、目标检测和图像分割任务。

| 任务 | 主要输出 | 例子 |
| --- | --- | --- |
| 图像分类 | 图片对应的类别 | 判断图片是否含有某种病害 |
| 目标检测 | 每个目标的类别与位置框 | 找出画面中的每个人和公交车 |
| 实例分割 | 每个目标实例的像素掩膜 | 分别描出每个果实的可见轮廓 |

YOLO 最初是面向目标检测提出的方法。名称来自 You Only Look Once，强调由一个神经网络在一次前向计算中从整张图像预测位置和类别。这里的“一次”不表示只训练一次，也不表示整个软件流程没有图像预处理与结果筛选。[原始论文](https://arxiv.org/abs/1506.02640) 描述了这一设计。

如今 YOLO 已经是一个包含不同版本与实现的模型家族。理解某一版本时，要查看对应文档，不能把最早版本的结构细节套到所有后续版本上。本文只完成目标检测入门，不做版本排名。

## 一张图片如何变成一组框

从学习角度，可以把检测过程分成四步：准备输入图像、提取图像特征、预测目标位置与类别、整理检测结果。很多现代检测网络使用 Backbone 提取特征、Neck 融合不同尺度信息、Head 产生预测，但各版本的具体设计并不完全相同。

一次检测往往不止输出一个框。每个框至少需要知道它的位置、预测类别以及置信度分数。以官方接口为例，`xyxy` 表示左上角和右下角的像素坐标，`cls` 表示类别编号，`conf` 表示置信度。[Ultralytics 检测文档](https://docs.ultralytics.com/tasks/detect/) 给出了这些字段。

例如，某个框显示 `person 0.87`，表示模型把框内目标判为人，并给出0.87的分数。它不能直接解释成“这个框有87%的概率正确”，更不是整张图片的识别准确率。

传统检测流程常使用非极大值抑制，即 NMS，筛除对同一目标的重复框。但不能说所有 YOLO 版本都必须依赖 NMS；具体后处理需要结合模型实现理解。本文使用的 YOLO11 示例保留常规检测流程，相关版本信息见 [YOLO11 官方文档](https://docs.ultralytics.com/models/yolo11/)。

## 先区分推理与训练

推理是使用已经学好的参数处理新图片；训练则需要图像及其标注，通过优化更新模型参数。用几行代码加载预训练权重完成检测，属于推理，不代表已经训练出了自己的模型。

本文选择 `yolo11n.pt` 作为固定的教学模型。`n` 表示这一系列的 nano 规格，适合用较小模型开始练习；这里不声称它是最新版本或所有任务的最佳选择。该权重在 COCO 的80类目标上预训练，能输出哪些类别受其训练设置限制。[模型与任务说明](https://docs.ultralytics.com/models/yolo11/) 列出了对应权重。

因此，把果园或农田照片交给这个模型，并不能期待它自动拥有“麦穗”“某种病斑”等专用类别。若目标类别不在原有类别表中，通常需要准备符合任务的标注数据并训练或微调。

## 准备独立环境

以下终端命令适用于 macOS 或 Linux。先进入练习目录，再建立虚拟环境。Windows 的激活命令不同。

```bash
mkdir -p yolo-image-demo
cd yolo-image-demo
python3 -m venv .venv
source .venv/bin/activate
python -m pip install ultralytics
```

安装会同时引入 PyTorch 等依赖，需要联网和一定磁盘空间。本文显式使用 CPU，方便没有独立显卡的电脑复现，不需要配置 CUDA。运行速度取决于硬件与输入，不把本例当作速度测试。

## 完整 Python 示例

在该目录创建 `detect_image.py`。脚本默认使用 Ultralytics 软件包附带的公交车示例图片，也支持传入自己的本地图片路径；首次加载模型时，库会下载缺失的权重。

```python
import argparse
from collections import Counter
from pathlib import Path

import torch
import ultralytics
from ultralytics import YOLO
from ultralytics.utils import ASSETS


def main():
    parser = argparse.ArgumentParser(description="使用 YOLO11 检测一张本地图片")
    parser.add_argument(
        "image", nargs="?", default=str(ASSETS / "bus.jpg"),
        help="本地图片路径，默认使用软件包中的公交车示例图"
    )
    args = parser.parse_args()
    source = Path(args.image).expanduser().resolve()
    if not source.is_file():
        raise FileNotFoundError(f"找不到图片：{source}，请传入有效的本地图片路径")

    print(f"Ultralytics 版本：{ultralytics.__version__}")
    print(f"PyTorch 版本：{torch.__version__}")
    model = YOLO("yolo11n.pt")
    results = model.predict(
        source=str(source),
        imgsz=640,
        conf=0.25,
        device="cpu",
        save=True,
        project="runs",
        name="first-detection",
        exist_ok=False,
        verbose=False,
    )

    result = results[0]
    counts = Counter()
    if result.boxes is not None:
        for box in result.boxes:
            category_id = int(box.cls.item())
            category = result.names[category_id]
            confidence = float(box.conf.item())
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            counts[category] += 1
            print(
                f"{category}：置信度={confidence:.3f}，"
                f"框=({x1:.1f}, {y1:.1f}, {x2:.1f}, {y2:.1f})"
            )

    if counts:
        print("各类别检测框数量：", dict(counts))
    else:
        print("当前阈值下没有检测框；这不等于图片中没有目标。")
    print("结果目录：", Path(result.save_dir).resolve())


if __name__ == "__main__":
    main()
```

运行默认示例并记录依赖版本：

```bash
python detect_image.py
python -m pip freeze > requirements.txt
```

程序会打印类别、分数、坐标和结果目录，并保存绘制了检测框的图片。再次运行时会自动选择新的结果目录，避免覆盖前一次输出。网络不可用且本地没有权重时，首次运行无法完成；可联网运行一次，之后保留下载好的 `yolo11n.pt`。

若要检测自己的图片，将图片放到练习目录并命名为 `my-photo.jpg` 后运行：

```bash
python detect_image.py my-photo.jpg
```

路径包含空格时要加引号。输出的类别计数是经过筛选的检测框数量，受漏检和重复检测影响，不是经过人工核实的真实目标数。

本文示例于2026年10月5日在 Apple Silicon Mac 上以 CPU 运行核对，环境为 Python 3.14.3、Ultralytics 8.4.173、PyTorch 2.14.1。默认图片得到以下检测框数量，并成功保存了带框图片：

```text
各类别检测框数量： {'bus': 1, 'person': 4}
```

这是一次推理的实际输出，不是对检测精度的评测。安装命令不固定版本，库、权重、输入图片或阈值改变后，输出可能变化；定位结果请以程序打印的目录为准。

## 几个参数分别改变什么

`conf=0.25` 是用于过滤输出的置信度阈值。提高它通常会减少保留的框，但也可能漏掉分数较低的真目标；降低它可能找回一些目标，同时增加误检。这个数值不是模型“准确率达到25%”的意思，也不存在适合所有任务的固定最佳阈值。

`imgsz=640` 设置推理时的目标输入尺寸，实际张量尺寸还受缩放、填充和实现设置影响。返回的 `xyxy` 坐标对应原图像素，不应直接用640去解释所有图片的坐标。增大输入尺寸可能保留更多小目标细节，但会增加计算开销，也不能保证精度一定提高。

`device="cpu"` 指定计算设备。先保持设备与模型固定，完成一次输入、预测、保存、查看的闭环，再研究加速，更容易定位问题。

## 怎样评价检测是否可靠

看一张画了框的图片只能做直观检查。如果要评价模型，需要有人工标注的独立数据，并按照统一规则匹配预测框和真实框。常见指标可以这样理解：

| 指标 | 回答的问题 |
| --- | --- |
| IoU | 预测框与真实框重叠得怎么样 |
| Precision | 被检测出来的目标中，有多少匹配正确 |
| Recall | 真实存在的目标中，有多少被找到了 |
| AP / mAP | 综合不同置信度阈值下的表现，再按类别等维度汇总 |

IoU 是两个框的交集面积除以并集面积：

$$
\operatorname{IoU}(A,B)=\frac{|A\cap B|}{|A\cup B|}
$$

例如，交集面积是40、并集面积是100，IoU 就是0.4。框的置信度与 IoU 是不同概念：模型可以很自信，但位置不准确。

判断一次匹配是否正确，还要满足类别、IoU 阈值及一对一匹配规则。`mAP50` 使用0.50的 IoU 阈值；常见的 `mAP50-95` 在0.50到0.95之间以0.05为间隔取多个阈值再汇总，对定位更严格。不同测试集、任务或评价设置下的数字不能直接比较。[指标说明](https://docs.ultralytics.com/guides/yolo-performance-metrics/) 给出了各指标的含义。

本例只有推理，没有带标注的评估集，因此不能根据打印的置信度计算或宣称模型的 mAP。

## 用到农业和遥感时，还需要准备什么

如果目标是统计照片中的果实或识别无人机图像中的植株，可以先明确目标类别和标注规则：被遮挡的目标是否标注，图像边缘只露出一部分的目标如何处理，大小差异如何覆盖。标注的一致性会影响模型学习与评价。

Ultralytics 常见的检测标注格式是一行对应一个框，依次为类别编号、归一化中心横坐标、归一化中心纵坐标、归一化宽度和高度；这些值与推理输出的像素 `xyxy` 不是同一种表示。正式制备数据前应核对 [检测数据集格式](https://docs.ultralytics.com/datasets/detect/)。

对大幅遥感影像进行切片时，还要考虑边缘目标、重叠区重复框和切片回拼。划分训练与测试数据时，应结合实际应用场景考虑按地块或采集批次隔离，避免相邻或重叠影像同时出现在两边。这是数据独立性原则在该场景中的具体应用，不是运行 YOLO 就会自动解决的步骤。

第一次练习的目标，是能解释每个输出字段，找到保存的图片，并辨认明显的误检与漏检。具备这一步经验之后，再准备自己的数据集，才容易区分问题来自数据、标注、训练设置还是模型本身。
