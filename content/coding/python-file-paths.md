---
title: 'Python 文件路径：为什么换个位置运行就找不到文件'
summary: '相对路径通常以当前工作目录为起点，不一定以脚本所在目录为起点。通过一个可以直接运行的小例子，区分两者并使用 pathlib 稳定定位文件。'
date: '2026-10-02'
section: coding
type: article
tags: [Python, 文件处理]
featured: true
draft: false
---

## 问题通常出在“从哪里开始找”

同一份 Python 脚本，在编辑器里能读取文件，换到终端运行却出现 `FileNotFoundError`，不一定是文件丢了，也可能是程序寻找文件的起点变了。

绝对路径从文件系统根位置开始描述文件；相对路径需要一个起点。在普通文件读写中，这个起点通常是**当前工作目录**，并不自动等于 `.py` 文件所在的目录。

例如，代码中的 `data/notes.txt` 表示“当前工作目录下 data 文件夹中的 notes.txt”。如果启动程序的位置改变，相同文字就可能指向另一个位置。

## 先看两个位置，再修改代码

把下面的完整示例保存为 `path_demo.py`。它只使用 Python 标准库：创建一个临时练习目录，模拟从其他目录启动脚本，再读取脚本旁边的数据。运行结束后临时目录自动清理。

```python
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import sys
import textwrap


with TemporaryDirectory() as temporary:
    root = Path(temporary)
    project = root / "project"
    data_dir = project / "data"
    data_dir.mkdir(parents=True)
    (data_dir / "notes.txt").write_text("路径定位成功", encoding="utf-8")

    script = project / "read_note.py"
    script.write_text(textwrap.dedent('''\
        from pathlib import Path

        # 当前工作目录由程序的启动方式决定
        print("工作目录是项目目录：", Path.cwd() == Path(__file__).parent)
        print("相对路径能找到文件：", Path("data/notes.txt").exists())

        # 以脚本所在目录为起点，定位与脚本一起存放的数据
        script_dir = Path(__file__).resolve().parent
        note = script_dir / "data" / "notes.txt"
        print(note.read_text(encoding="utf-8"))
    '''), encoding="utf-8")

    # 故意从项目外部启动，复现工作目录与脚本目录不一致的情况
    result = subprocess.run(
        [sys.executable, str(script)],
        cwd=root,
        check=True,
        capture_output=True,
        encoding="utf-8",
    )
    print(result.stdout, end="")
```

运行 `python3 path_demo.py`，预期输出：

```text
工作目录是项目目录： False
相对路径能找到文件： False
路径定位成功
```

这里创建子进程只是为了复现问题。真正需要记住的是：`Path.cwd()` 查看工作目录；在普通 `.py` 脚本中，`Path(__file__).resolve().parent` 可以定位脚本所在目录。它们可能相同，也可能不同。[Python pathlib 文档](https://docs.python.org/3/library/pathlib.html) 提供了这些方法的完整说明。

## 按文件的用途选择起点

如果文件随脚本一起分发，例如练习数据、固定配置，可以围绕脚本目录构造路径。`Path` 的 `/` 运算符可以拼接路径，不必手写系统相关的分隔符。

如果程序处理的是用户指定的文件，则更适合接收文件路径参数。此时用户输入的相对路径通常应按其运行命令的位置解释，不必强行改成脚本目录。

Jupyter Notebook 和交互式控制台通常没有 `__file__`，不能直接套用脚本写法。可以先检查工作目录，再明确指定项目根目录。

## 文件仍然读不到时检查什么

| 现象 | 优先检查 |
| --- | --- |
| 报文件不存在 | 起点、文件名、扩展名以及大小写 |
| 文件存在却无法读取 | 是否实际指向目录，或是否缺少访问权限 |
| 中文出现乱码或解码失败 | 文件实际编码与读取时指定的编码是否一致 |
| 写入后原内容消失 | 是否使用了覆盖模式 `w`，而本意是追加模式 `a` |

排查时可以打印 `path.resolve()`，查看程序最终寻找的位置。`resolve()` 能帮助理解路径，但不会替你创建缺失的文件。

定位文件之后，结构化表格应交给相应解析工具处理。下一篇 [Python CSV 读写笔记](https://yuanzhibx.github.io/coding/python-csv-basics/) 使用标准库完成读取、数值转换和保存。

## 整理来源

本文基于个人 Obsidian 笔记《Python Basics》中 P30–P32 的学习内容重新组织。原笔记参考 [《3小时超快速入门 Python｜动画教学》](https://www.bilibili.com/video/BV1Jgf6YvE8e/)。本文的临时目录与子进程示例为本次整理新增，不是视频逐字稿或教材源码。
