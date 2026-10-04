---
title: '用 Python 计算平均值、中位数和样本标准差'
summary: '从一组演示数据出发，用清晰的函数实现三个基本统计量，再与标准库对照，检查空数据、单元素与奇偶长度等边界。'
date: '2026-10-02'
section: coding
type: article
tags: [Python, 数据处理, 统计]
featured: false
draft: false
---

## 三个结果分别描述什么

平均值把总量平均分配到每个观测值；中位数描述排序后的中间位置；标准差描述数据围绕平均值的离散程度。它们回答的问题不同，不能只看其中一个数就概括全部数据。

例如，演示数据 `[1, 2, 3, 4, 100]` 的平均值为 22，中位数为 3。两者差别很大，是因为平均值对这里的极大值更敏感，而不是哪一个计算错了。

本篇接续 [CSV 读写笔记](https://yuanzhibx.github.io/coding/python-csv-basics/)，集中练习计算函数。下面都是教学数值，不是实验观测或实际成绩。

## 先明确公式与输入约定

算术平均值为 $\bar{x}=\frac{1}{n}\sum_{i=1}^{n}x_i$。奇数个数的中位数取排序后的中间项，偶数个数取中间两项的平均值。

本文计算的样本标准差是：

$$
s=\sqrt{\frac{\sum_{i=1}^{n}(x_i-\bar{x})^2}{n-1}}
$$

分母为 $n-1$，所以至少需要两个值。若把这组数据作为完整总体进行描述，对应总体标准差通常采用分母 $n$。应先明确统计对象，不能为了让结果变小而随意更换分母。使用 $n-1$ 并不意味着开平方后的样本标准差对总体标准差也严格无偏。

本例接受列表或元组中的有限 `int`、`float`，拒绝布尔值、文本、NaN 和无穷大。它是教学实现，未处理极大数值可能导致的溢出，也不是高精度数值计算库。

## 完整代码

保存为 `basic_statistics.py`，使用 Python 3.10 及以上运行。三个函数均不修改输入列表。

```python
import math
import statistics


def validate(values, minimum=1):
    if len(values) < minimum:
        raise ValueError(f"至少需要 {minimum} 个数据")
    for value in values:
        # bool 虽是 int 的子类，本例仍将它视为不合法的测量值
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError("数据必须是整数或浮点数")
        if not math.isfinite(value):
            raise ValueError("数据必须是有限数值")


def mean(values):
    validate(values)
    return sum(values) / len(values)


def median(values):
    validate(values)
    ordered = sorted(values)
    middle = len(ordered) // 2
    if len(ordered) % 2:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2


def sample_std(values):
    validate(values, minimum=2)
    average = mean(values)
    squared_sum = 0.0
    for value in values:
        difference = value - average
        squared_sum += difference ** 2
    return math.sqrt(squared_sum / (len(values) - 1))


data = [80, 90, 75, 95]
print(f"平均值：{mean(data):.2f}")
print(f"中位数：{median(data):.2f}")
print(f"样本标准差：{sample_std(data):.2f}")

# 用标准库和已知边界结果核对教学实现
for values in ([80, 90, 75, 95], [1, 2, 3], [7, 7], [-3, -1]):
    assert math.isclose(mean(values), statistics.mean(values))
    assert math.isclose(median(values), statistics.median(values))
    assert math.isclose(sample_std(values), statistics.stdev(values))
assert mean([5]) == median([5]) == 5
assert data == [80, 90, 75, 95]

for function, values in [
    (mean, []), (median, []), (sample_std, [1]),
    (mean, [float("nan")]), (mean, [float("inf")]),
    (mean, [True]), (mean, ["3"]),
]:
    try:
        function(values)
    except ValueError:
        pass
    else:
        raise AssertionError("非法输入应被拒绝")
print("边界检查通过")
```

预期输出：

```text
平均值：85.00
中位数：85.00
样本标准差：9.13
边界检查通过
```

## 实现中容易忽略的地方

`sorted()` 创建排序副本，因此计算中位数不会打乱原数据。偶数长度的中间索引是 `middle - 1` 和 `middle`，不能直接取一项。

不能将缺失数据默认为零。示例选择直接拒绝非法输入；实际任务可以清洗后再计算，但必须说明排除规则和剩余样本量。

断言用于检查程序，不替代 `validate()` 中的正式校验，因为 Python 优化运行时可以关闭 `assert`。浮点结果比较采用 `math.isclose()`，不要求全部二进制小数位完全相同。

## 何时使用标准库

手写实现有助于看懂公式，常规工作则可以使用 `statistics.mean()`、`median()`、`stdev()`；总体标准差对应 `pstdev()`。具体行为与输入要求见 [Python statistics 官方文档](https://docs.python.org/3/library/statistics.html)。

本文根据个人 Obsidian《课本实例学习路线》实例 9 重新组织，原材料参考《Python语言程序设计基础》第三版。网站版本补充了输入校验、标准库对照与边界测试；语法不熟悉时可回查 [Python 基础笔记](https://yuanzhibx.github.io/coding/python-basics/)。
