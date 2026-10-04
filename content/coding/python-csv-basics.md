---
title: '用 Python 读写 CSV：编码、数字转换与常见错误'
summary: '用一份明确标注的演示数据，完成 CSV 的写入、读取、成绩计算与结果保存，并说明为什么不应该直接按逗号拆分每一行。'
date: '2026-10-02'
section: coding
type: article
tags: [Python, 文件处理, CSV]
featured: false
draft: false
---

## CSV 是文本，但不能随意拆分

CSV 常用逗号分隔字段，但字段内部也可能含有逗号、引号甚至换行。例如，备注 `练习,非实测` 是一个完整字段，不应该被拆成两列。

因此，处理 CSV 时应使用 Python 标准库 `csv`，让解析器处理引号和分隔符规则。不要把每行的 `split(",")` 当成通用读取方法。

本文全部姓名、成绩和备注均为演示数据，不代表真实个人信息或学习记录。

## 一次完成写入、读取和计算

将下面代码保存为 `csv_demo.py`，执行 `python3 csv_demo.py`。示例只使用标准库，所有文件都写入临时目录，结束后自动删除，不会覆盖自己的资料。

```python
from pathlib import Path
from tempfile import TemporaryDirectory
import csv


samples = [
    {"name": "示例甲", "score": 86, "note": "练习,非实测"},
    {"name": "示例乙", "score": 92, "note": "普通记录"},
    {"name": "示例丙", "score": "缺考", "note": "不计入平均分"},
]

with TemporaryDirectory() as temporary:
    folder = Path(temporary)
    source = folder / "scores.csv"
    target = folder / "valid_scores.csv"
    fields = ["name", "score", "note"]

    # 明确编码和字段顺序，让 csv 模块处理换行与引号
    with source.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(samples)

    valid_rows = []
    with source.open("r", encoding="utf-8", newline="") as file:
        for row in csv.DictReader(file):
            try:
                score = int(row["score"])
            except ValueError:
                print(f"跳过非整数成绩：{row['name']} / {row['score']}")
                continue

            # 本例约定成绩必须是 0～100 的整数
            if not 0 <= score <= 100:
                print(f"跳过范围外成绩：{row['name']} / {score}")
                continue

            row["score"] = score
            valid_rows.append(row)

    if valid_rows:
        average = sum(row["score"] for row in valid_rows) / len(valid_rows)
        print(f"有效记录：{len(valid_rows)}")
        print(f"平均分：{average:.2f}")
        print(f"完整备注：{valid_rows[0]['note']}")
    else:
        print("没有有效成绩，不计算平均分")

    # 另存结果，不修改输入文件
    with target.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(valid_rows)

    # 再读一次输出，确认保存结果与预期一致
    with target.open("r", encoding="utf-8", newline="") as file:
        saved = list(csv.DictReader(file))
    expected = [{**row, "score": str(row["score"])} for row in valid_rows]
    assert saved == expected
    print(f"已验证输出记录：{len(saved)}")
```

预期输出：

```text
跳过非整数成绩：示例丙 / 缺考
有效记录：2
平均分：89.00
完整备注：练习,非实测
已验证输出记录：2
```

备注中的逗号被完整保留，说明它仍然是一个字段；缺考记录被明确报告并排除，没有悄悄变成零分。

## 三个参数各管一件事

`encoding="utf-8"` 指定文本编码。它不是自动识别工具：如果真实文件来自其他编码，需要先确定其来源。对于带 UTF-8 BOM 的文件，可使用 `utf-8-sig` 读取，避免 BOM 混入第一个字段名。

`newline=""` 让 `csv` 模块按自身规则处理换行。Python 官方文档建议读写 CSV 文件时采用这种设置，以正确处理字段中的换行，并避免某些平台写入多余回车。

`fieldnames` 确定输出列名和顺序。`DictWriter` 不会自动猜测你希望保留哪些字段，`writeheader()` 才会写出表头。[Python csv 文档](https://docs.python.org/3/library/csv.html) 中有相应说明。

## 读出来的数字为什么还要转换

本例使用默认设置的 `DictReader`，读取到的字段值是字符串。写入时的整数 `86`，读回后是字符串 `"86"`；参与求和之前需要按业务规则转换。

示例约定只接受 0～100 的整数，所以使用 `int()` 并检查范围。如果任务允许小数，应调整转换和校验规则，而不是直接照搬这份代码。

这里选择“报告并跳过”无效成绩，是演示程序的规则。正式数据任务也可能要求遇到错误立即停止，或者把无效记录单独保存，具体取决于数据用途。

## 换成自己的文件之前

确认表头是否真的叫 `name`、`score`、`note`，以及分隔符是不是逗号。这个示例自行生成了固定结构的输入，没有实现任意表格的列名识别。

先保留输入文件，再把结果另存为新文件；不要让输入和输出指向同一个路径。还应检查没有有效记录时的处理，避免空列表求平均导致除零。

如果首先遇到的是“文件找不到”，可以先看 [Python 文件路径笔记](/coding/python-file-paths/)，把路径起点确认清楚，再排查文件内容。

## 整理来源

本文由个人 Obsidian 笔记《〈Python语言程序设计基础〉每日复习笔记》的 Day 9 整理而来。原材料用于教材复习；这里重新编写了带逗号字段、无效数据处理和保存验证的完整示例，并参照 Python 官方文档核对接口行为。
