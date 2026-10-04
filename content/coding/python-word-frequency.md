---
title: '从一段英文文本开始做词频统计'
summary: '用明确的分词规则、Counter 和稳定排序完成一个小型词频程序，理解大小写、撇号、连字符和中文文本为什么需要分别处理。'
date: '2026-10-02'
section: coding
type: article
tags: [Python, 文本处理]
featured: false
draft: false
---

## 统计之前先定义“一个词”

词频统计看起来只是数次数，但第一步就需要做选择：`Python` 与 `python` 是否算同一个词？`don't` 保留为一个词吗？连字符连接的两个片段如何处理？

本篇采用一套刻意简化的规则：不区分大小写；只统计 ASCII 英文字母组成的单词；保留单词内部的直撇号；将弯撇号先统一为直撇号；连字符和数字作为分隔；不删除停用词，不合并词形。

这些是程序的约定，不是所有语言学任务通用的“正确分词”。例如 `learn` 和 `learning` 在这里仍然是两个词。

## 完整实现

保存为 `word_frequency.py`，使用 Python 3.10 及以上运行。示例仅用标准库，文本为本篇编写的演示句子。

```python
import re
from collections import Counter


def tokenize(text):
    normalized = text.lower().replace("’", "'")
    # 撇号两侧必须有字母，单独的引号不会被统计为词
    return re.findall(r"[a-z]+(?:'[a-z]+)*", normalized)


def top_words(text, limit=10):
    if isinstance(limit, bool) or not isinstance(limit, int) or limit < 0:
        raise ValueError("limit 必须是非负整数")
    counts = Counter(tokenize(text))
    # 次数相同时按单词字母顺序排列，确保输出规则明确
    ordered = sorted(counts.items(), key=lambda item: (-item[1], item[0]))
    return ordered[:limit]


sample = "Python helps. Python is useful; don't stop. Don't stop!"
for word, count in top_words(sample, limit=4):
    print(f"{word}: {count}")

# 覆盖空文本、纯标点、撇号、连字符和并列次数
assert top_words("") == []
assert top_words("... ' ’ 123") == []
assert tokenize("Don't don’t") == ["don't", "don't"]
assert tokenize("data-driven") == ["data", "driven"]
assert top_words("b a b a") == [("a", 2), ("b", 2)]
assert top_words("Python", limit=0) == []
assert tokenize("中文学习") == []
try:
    top_words("example", limit=-1)
except ValueError:
    pass
else:
    raise AssertionError("负数条数应被拒绝")
print("边界检查通过")
```

预期输出：

```text
don't: 2
python: 2
stop: 2
helps: 1
边界检查通过
```

## 分词、计数、排序各做一件事

正则中的 `[a-z]+` 匹配一个或多个英文字母；后面的 `(?:'[a-z]+)*` 允许继续出现“撇号＋字母”，因此不会把孤立的引号当成词。

`Counter` 将词序列汇总为“词 → 次数”的映射。它本身也有 `most_common()` 方法；本例额外使用 `sorted()`，是为了明确指定并列次数时按字母顺序输出，而不是依赖首次出现顺序。[Python Counter 文档](https://docs.python.org/3/library/collections.html#collections.Counter) 说明了计数器和相关方法。

排序键 `(-次数, 单词)` 中，负号让次数大的排在前面；次数相同才比较单词。`[:limit]` 取前几项，`limit=0` 返回空结果。

## 这份规则不能直接覆盖哪些情况

程序不会识别带重音字母的完整词，例如 `café` 会被截成 `caf`。中英混排时，它只提取英文字母片段，也不会自动识别人名、缩写或词义。

中文通常需要另外的分词方案；不能仅仅把正则范围扩成汉字，就声称得到了中文词频。即使完成分词，停用词表、别名归一和词形处理仍会改变统计结果，应在文章或报告中说明。

因此，这个程序适合观察受控英文演示文本的计数过程，不是通用自然语言分析系统。高频词也不自动等于主题词或重要词。

## 改成读取文件时

把已经读取到的字符串交给 `top_words()` 即可，文件定位与文本编码应单独处理。可以结合 [文件路径笔记](https://yuanzhibx.github.io/coding/python-file-paths/) 完成扩展，再用自己允许公开的短文本检查结果。

本文根据个人 Obsidian《课本实例学习路线》实例 10 整理，原材料参考《Python语言程序设计基础》第三版。网站版本重新设计演示文本、撇号规则和边界测试，不转载书中的长篇文学语料；函数与字典用法可回查 [Python 基础笔记](https://yuanzhibx.github.io/coding/python-basics/)。
