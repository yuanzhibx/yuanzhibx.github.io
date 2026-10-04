---
title: 'Python 基础笔记：从变量和循环到类、文件与测试'
summary: '将 Python 基础学习材料整理为可查阅的笔记，包含核心概念、独立示例、常见错误和语法速查，并连接文件处理与数据统计练习。'
date: '2026-10-02'
section: coding
type: article
tags: [Python, 基础语法]
featured: true
draft: false
---

这是一份根据个人 Obsidian《Python Basics》重新编排的基础笔记，覆盖原学习材料 P6–P37 的主题。适合一边运行示例，一边查阅语法；内容整理不代表已经完成所有练习或项目。

每个 Python 代码块均可单独保存为 `.py` 文件运行。本文采用 Python 3.10 及以上语法，只用标准库；`input()` 示例需要交互输入，`unittest` 示例会输出测试报告。人物、成绩、温度和日期均是教学数据。

第一次阅读可按章节顺序推进，复习时使用右侧目录或文末速查。含“语法格式”的 `text` 代码块是说明性模板，不应直接作为程序执行。

## 输入、变量与数据类型

### 输出函数 print

**核心概念** 

`print()` 是 Python 的内置输出函数，用于把文本、数字、变量值或表达式结果显示到终端。圆括号中放要输出的对象；字符串需要使用单引号或双引号包围，数字和表达式可以直接写。一次调用可以输出多个对象，Python 会先把它们转换成适合显示的文本。

**语法格式** 

```text
print(对象1, 对象2, ...)
```

```python
# 输出文字、变量和计算结果
course = "Python"
hours = 3

print("开始学习 Python")
print("课程：", course)
print("预计分钟数：", hours * 60)
```

> **易错点** 
> `print` 后必须使用英文圆括号。输出文字时不能漏掉引号；变量名则不能加引号，否则打印的是变量名本身，而不是变量保存的值。Python 字符串可以使用单引号或双引号，但开头和结尾必须匹配。

### print 的分隔、换行与转义

**核心概念** 

`print()` 默认用一个空格分隔多个对象，并在结尾添加换行。可以通过 `sep` 修改分隔符，通过 `end` 修改结尾字符。字符串中的反斜杠可引入转义字符，例如 `\n` 表示换行、`\t` 表示制表符、`\\` 表示一个反斜杠。三引号字符串适合保存跨多行文本。

**语法格式** 

```text
print(对象1, 对象2, sep="分隔符", end="结尾字符")
```

```python
# 控制分隔符与结尾字符
print("2026", "10", "02", sep="-")
print("加载中", end="...")
print("完成")

# 转义字符和多行字符串
print("姓名\t成绩")
print("小林\t95")
poem = """第一行
第二行"""
print(poem)
```

> **易错点** 
> `sep` 和 `end` 是关键字参数，必须写在普通输出对象之后。`\n` 只有位于字符串中才表示换行；若路径中包含大量反斜杠，可以使用原始字符串，如 `r"C:\\data\\file.txt"`，但原始字符串不能以单个反斜杠结尾。

### 变量与赋值

**核心概念** 

变量是指向某个值的名称。赋值语句 `名称 = 值` 会先计算右侧，再让左侧名称引用计算结果。Python 是动态类型语言，同一个变量可以在不同时刻引用不同类型的对象，但频繁改变变量含义会降低可读性。变量可以重新赋值，也可以使用同步赋值一次交换两个值。

**语法格式** 

```text
变量名 = 值
变量1, 变量2 = 值1, 值2
```

```python
# 创建变量并更新变量
name = "小林"
score = 90
score = score + 5

# 同步赋值与变量交换
left, right = "A", "B"
left, right = right, left

print(name, score)
print(left, right)
```

> **易错点** 
> `=` 表示赋值，不表示数学中的恒等关系；判断两个值是否相等要使用 `==`。第一次使用变量前必须先赋值，否则会触发 `NameError`。`score = score + 5` 的含义是读取旧值、加 5、再把新值赋回 `score`。

### 标识符与命名规范

**核心概念** 

变量名、函数名和类名都属于标识符。常用英文标识符由字母、数字和下划线组成，不能以数字开头；Python 也支持符合规则的 Unicode 标识符，也不能使用 `if`、`for`、`class` 等 Python 关键字。Python 区分大小写，因此 `name`、`Name` 和 `NAME` 是三个不同名称。好名称应准确表达数据含义，而不是只写 `a`、`x1` 等含糊缩写。

**语法格式与代码示例** 

- 变量和函数：小写加下划线，如 `student_score`、`calculate_average`。
- 类：大驼峰命名，如 `StudentRecord`。
- 常量：全大写加下划线，如 `MAX_RETRY`。
- 布尔变量：使用 `is_`、`has_`、`can_` 等前缀表达真假含义。

```python
# 名称直接表达用途
student_name = "小林"
final_score = 92
is_passed = final_score >= 60
MAX_RETRY = 3

print(student_name, final_score, is_passed, MAX_RETRY)
```

> **易错点** 
> 不要使用 `list`、`str`、`sum`、`input` 等内置名称作为变量名，否则会遮蔽原有函数。中文变量名在语法上可用，但协作和跨平台场景通常采用有意义的英文名称。

### 数学运算与优先级

**核心概念** 

Python 支持加 `+`、减 `-`、乘 `*`、真除 `/`、整除 `//`、取余 `%` 和幂运算 `**`。`/` 的结果通常是浮点数；`//` 取得向下取整后的商；`%` 取得余数。常见用途包括判断奇偶、循环分组和单位换算。运算优先级大致为：括号、幂、正负号、乘除整除取余、加减。

**语法格式** 

```python
# 常用数学运算
a = 17
b = 5

print(a + b)   # 22
print(a / b)   # 3.4
print(a // b)  # 3
print(a % b)   # 2
print(b ** 2)  # 25

# 使用括号明确运算顺序
average = (88 + 92 + 95) / 3
is_even = a % 2 == 0
print(average, is_even)
```

> **易错点** 
> `^` 不是幂运算，而是按位异或；平方应写 `x ** 2`。负数的 `//` 会向负无穷方向取整，例如 `-7 // 3` 等于 `-3`。复杂表达式不要只依赖记忆优先级，使用括号更清楚。

### 注释与代码说明

**核心概念** 

注释用于解释代码意图，不参与程序执行。单行注释以 `#` 开始，可以独占一行，也可以写在代码之后。多行说明通常使用多行 `#`；三引号字符串只有放在模块、类或函数开头时才是文档字符串，并不等同于普通注释。好的注释解释“为什么这样做”，而不是重复代码已经表达的动作。

**语法格式** 

```python
def calculate_discount(price: float, is_member: bool) -> float:
    """计算会员折后价格。"""
    # 会员统一享受九折，规则变化时只需修改此处
    if is_member:
        return price * 0.9
    return price


original_price = 100.0
final_price = calculate_discount(original_price, True)
print(final_price)
```

> **编写原则** 
> 变量名和函数名应先做到自解释，再用注释补充业务规则、边界条件和设计原因。代码修改后要同步更新注释；错误或过期的注释比没有注释更容易误导读者。

### 基本数据类型与类型转换

**核心概念** 

基础阶段最常用的类型包括整数 `int`、浮点数 `float`、字符串 `str`、布尔值 `bool` 和空值 `None`。`type()` 可查看对象类型，`isinstance()` 更适合在程序中判断类型。`int()`、`float()`、`str()` 和 `bool()` 可以创建或转换数据，但转换必须满足目标类型的格式要求。

**语法格式** 

```python
# 查看类型并进行转换
age_text = "20"
age = int(age_text)
height = float("1.75")
message = "年龄：" + str(age)
is_adult = age >= 18
missing_value = None

print(type(age).__name__)
print(height, message, is_adult, missing_value)
print(isinstance(age, int))
```

> **易错点** 
> `int("3.5")` 会触发 `ValueError`，应先转为 `float`，再根据需求处理。浮点数采用二进制近似表示，`0.1 + 0.2` 不一定精确等于 `0.3`。`bool("False")` 仍为 `True`，因为任何非空字符串都是真值；不能把字符串内容直接当作布尔含义。

### 交互模式与脚本模式

**核心概念** 

交互模式（REPL）会读取一条语句、立即执行并显示结果，适合试验表达式、查看函数行为和快速排错。脚本模式把代码保存在 `.py` 文件中，再整体运行，适合可重复使用的程序。正式学习成果应保存为脚本；交互模式中的试验不会自动成为项目文件。

**语法格式与代码示例** 

终端执行 `python3` 可进入交互模式，执行 `python3 文件名.py` 可运行脚本。编辑器中的运行按钮本质上也是选择解释器并执行脚本。

```python
# 这段代码保存为脚本后可以重复运行
numbers = [3, 5, 8]
total = sum(numbers)
average = total / len(numbers)

print("总和：", total)
print("平均值：", average)
```

> **易错点** 
> 交互模式常显示表达式的返回值，而脚本不会自动显示；脚本中需要显式调用 `print()`。若编辑器与终端使用了不同解释器，可能出现“终端可导入、编辑器却找不到模块”的情况，应先核对 Python 解释器路径。

### 使用 input 获取输入

**核心概念** 

`input()` 会显示提示文字，暂停程序并等待用户输入；按下回车后，它返回一个字符串。即使用户输入的是数字，得到的也仍是 `str`，进行数学计算前必须显式转换。`strip()` 可移除输入首尾多余空白，适合处理姓名、命令等文本。

**语法格式** 

```text
变量 = input("提示信息")
数字 = int(input("提示信息"))
```

```python
# 获取文字和数值输入
name = input("请输入姓名：").strip()
age = int(input("请输入年龄："))
next_age = age + 1

print(f"{name}，你明年 {next_age} 岁。")
```

> **易错点** 
> 不要写成 `int(input)(...)`，转换函数必须包住 `input()` 的返回值。用户可能输入空字符串或非数字文本，真实应用需要配合异常处理。不要使用 `eval(input())` 解析普通输入，因为它会执行用户提供的代码，存在安全风险。

## 条件判断与逻辑运算

### 条件语句 if

**核心概念** 

条件语句根据布尔表达式决定是否执行某段代码。`if` 后写条件并以冒号结尾，属于该分支的语句必须保持一致缩进。`else` 在条件为假时执行。比较运算包括 `==`、`!=`、`>`、`>=`、`<`、`<=`，运算结果都是布尔值。

**语法格式** 

```text
if 条件:
    条件为真时执行
else:
    条件为假时执行
```

```python
# 判断成绩是否及格
score = 76

if score >= 60:
    result = "及格"
else:
    result = "不及格"

print(result)
```

> **易错点** 
> `if score = 60` 是错误语法，相等比较必须使用 `==`。冒号和缩进都是语法的一部分，推荐每层使用 4 个空格，不要混用 Tab 与空格。条件不需要写成 `if is_ready == True`，直接写 `if is_ready` 更清楚。

### 多分支与嵌套判断

**核心概念** 

当结果超过两种时使用 `if / elif / else`。Python 会从上到下检查条件，只执行第一个成立的分支，因此条件顺序直接影响结果。嵌套 `if` 适合第二个判断确实依赖第一个判断的情况；如果多个条件处于同一层级，优先使用 `elif`，避免过深缩进。

**语法格式** 

```python
# 先校验范围，再从高到低判断等级
score = 86

if not 0 <= score <= 100:
    level = "无效成绩"
elif score >= 90:
    level = "优秀"
elif score >= 80:
    level = "良好"
elif score >= 60:
    level = "及格"
else:
    level = "不及格"

print(level)
```

> **易错点** 
> 若先写 `score >= 60`，那么 95 分也会在该分支停止，后面的优秀条件永远没有机会执行。连续区间通常从高到低或从低到高排列。嵌套层级超过两三层时，应考虑提前返回、合并条件或拆分函数。

### 逻辑运算与短路求值

**核心概念** 

`and` 要求两侧都为真，`or` 只需一侧为真，`not` 用于取反。优先级通常是 `not` 高于 `and`，`and` 高于 `or`，但复杂条件应使用括号表达意图。Python 使用短路求值：`and` 左侧为假时不再计算右侧，`or` 左侧为真时不再计算右侧。

**语法格式** 

```python
# 组合多个条件
age = 20
has_ticket = True
is_banned = False

can_enter = age >= 18 and has_ticket and not is_banned
print("允许进入：", can_enter)

# 短路求值避免空字符串索引错误
name = "小林"
starts_with_xiao = bool(name) and name[0] == "小"
print(starts_with_xiao)
```

> **易错点** 
> 不要写 `age >= 18 and <= 60`，每个比较对象都要明确，或使用链式比较 `18 <= age <= 60`。`and`、`or` 返回的不一定是布尔值，而可能是参与运算的对象；需要明确布尔结果时可以使用 `bool()`。

## 容器与循环

### 列表

**核心概念** 

列表 `list` 用于保存一组有顺序、可修改的数据，可以包含重复元素。索引从 0 开始，负索引从末尾开始；切片 `[start:stop]` 包含起点、不包含终点。常见修改方法包括 `append()`、`insert()`、`remove()` 和 `pop()`；`sort()` 原地排序，`sorted()` 返回新列表。

**语法格式** 

```python
# 创建、查询和修改列表
scores = [88, 95, 76]
scores.append(91)
scores[0] = 90

first = scores[0]
last_two = scores[-2:]
ordered = sorted(scores)

print("第一项：", first)
print("最后两项：", last_two)
print("原列表：", scores)
print("排序副本：", ordered)
```

> **易错点** 
> 访问不存在的索引会触发 `IndexError`。`append([1, 2])` 会把整个列表作为一个元素加入；若要逐项合并，使用 `extend([1, 2])`。`scores = scores.sort()` 会让 `scores` 变成 `None`，因为 `sort()` 修改原列表而不返回排序结果。

### 字典

**核心概念** 

字典 `dict` 保存“键—值”映射，适合通过唯一标识快速查找数据。键必须可哈希，常用字符串、数字或只包含可哈希元素的元组；值可以是任意类型。使用方括号读取不存在的键会触发 `KeyError`，`get()` 可以提供默认值。字典保持插入顺序，但核心含义仍是按键访问，而不是按位置访问。

**语法格式** 

```python
# 创建、查询、更新和遍历字典
student = {"name": "小林", "score": 88}
student["score"] = 93
student["city"] = "北京"

print(student["name"])
print(student.get("age", "未填写"))

for key, value in student.items():
    print(f"{key}: {value}")
```

> **易错点** 
> 字典键不能是列表，因为列表可变且不可哈希。判断键是否存在应写 `if key in data`，而不是在 `data.values()` 中查找。`get()` 适合读取可缺省字段；若缺少某键代表程序错误，则直接使用方括号更容易及时暴露问题。

### for 循环

**核心概念** 

`for` 循环从可迭代对象中依次取出元素，适合遍历列表、字符串、字典和明确次数的范围。`range(stop)` 生成从 0 到 `stop - 1` 的整数序列；`range(start, stop, step)` 可指定起点和步长。需要索引和值时使用 `enumerate()`，比手动维护计数器更可靠。

**语法格式** 

```python
# 遍历数据并筛选异常值
temperatures = [18.5, 27.8, 18.7, 28.2]

for index, temperature in enumerate(temperatures, start=1):
    if temperature >= 25:
        print(f"第 {index} 条演示温度超过阈值：{temperature}℃")

# range 的终点不包含在结果中
total = 0
for number in range(1, 6):
    total += number
print("1 到 5 的和：", total)
```

> **易错点** 
> `range(1, 5)` 只产生 1、2、3、4。不要在遍历列表时随意删除其中元素，否则可能跳过数据；可以遍历副本或用列表推导式生成新列表。循环变量在每轮会被重新赋值，修改它本身不会自动修改原容器。

### while 循环与循环控制

**核心概念** 

`while` 在条件为真时重复执行，适合循环次数事先不确定的任务，例如持续接收命令、重试和逐步逼近。循环体必须能够改变条件，否则可能形成无限循环。`break` 立即结束最近一层循环，`continue` 跳过本轮剩余语句并进入下一轮。

**语法格式** 

```python
# 在限定次数内寻找第一个满足条件的值
number = 0

while number < 10:
    number += 1
    if number % 2 != 0:
        continue
    if number > 6:
        break
    print("偶数：", number)

print("循环结束时 number =", number)
```

> **易错点** 
> 使用 `continue` 前要确认计数器已经更新，否则程序可能永远停在同一轮。`break` 只退出最内层循环，不会自动退出外层循环或整个函数。若循环本质上是在遍历一个已有序列，通常优先使用 `for`，表达更直接。

## 字符串格式化与函数

### 格式化字符串

**核心概念** 

格式化字符串把变量嵌入文本，并控制数字精度、宽度和对齐方式。现代 Python 首选 f-string：在字符串引号前加 `f`，用 `{表达式}` 插入结果。冒号后的格式说明符可控制显示形式，如 `.2f` 保留两位小数、`,` 添加千位分隔符、`>10` 右对齐到宽度 10。

**语法格式** 

```text
f"固定文字{变量:格式说明符}"
"模板{}".format(值)
```

```python
# 使用 f-string 组织清晰的输出
name = "小林"
score = 92.456
income = 1234567.8

print(f"{name}的成绩是 {score:.2f}")
print(f"收入：{income:,.2f} 元")
print(f"{'项目':<8}{'分数':>8}")
print(f"{'Python':<8}{score:>8.1f}")
```

> **易错点** 
> 忘记字符串前的 `f` 会原样输出花括号。格式化只改变显示结果，不会修改变量本身；`score` 仍保存原来的浮点数。需要输出字面量花括号时写 `{{` 和 `}}`。外部输入不要直接拼成格式模板，固定模板、只替换值更安全。

### 函数基础

**核心概念** 

函数把一段有明确职责的代码封装起来，通过名称重复调用。定义以 `def` 开始，函数名后是参数列表，函数体使用缩进。参数是函数接收输入的局部名称。良好函数通常只完成一件事，名称使用动词表达行为，从而减少重复代码并提高可测试性。

**语法格式** 

```text
def 函数名(参数1, 参数2):
    函数体
```

```python
# 定义函数后可以多次调用
def greet(name: str) -> None:
    """向指定用户问好。"""
    print(f"你好，{name}！")


greet("小林")
greet("小周")
```

> **易错点** 
> 定义函数不会自动执行函数体，必须在定义之后调用。函数调用时的参数数量要与定义匹配。不要把所有代码都塞进一个巨型函数；输入、计算和输出可以分开，使核心计算函数不依赖终端交互。

### 参数、返回值与作用域

**核心概念** 

`return` 把结果交还给调用者，并立即结束当前函数。没有显式 `return` 的函数返回 `None`。参数可使用位置传递或关键字传递，还可以设置默认值。函数内部创建的普通变量属于局部作用域，外部不能直接访问；应优先用参数传入数据、用返回值传出结果，而不是依赖全局变量。

**语法格式** 

```python
# 参数、默认值、关键字调用和返回值
def calculate_price(price: float, discount: float = 1.0) -> float:
    """返回折后价格。"""
    if price < 0:
        raise ValueError("价格不能为负数")
    return price * discount


normal_price = calculate_price(100)
member_price = calculate_price(price=100, discount=0.9)
print(normal_price, member_price)
```

> **易错点** 
> `print(result)` 是显示结果，`return result` 才是把结果交给调用者。默认参数应放在无默认值参数之后。不要使用列表、字典等可变对象作为默认值；需要时使用 `None`，再在函数内部创建新对象。局部变量与全局变量同名时，局部名称会遮蔽全局名称。

## 模块与面向对象

### 模块的导入与使用

**核心概念** 

模块通常是一个 `.py` 文件，用来组织可复用代码。`import 模块` 保留模块命名空间，调用时写 `模块.成员`；`from 模块 import 成员` 可直接使用指定成员；`as` 用于设置常见别名。标准库随 Python 安装，第三方库需要在当前解释器环境中另行安装。

**语法格式** 

```python
# 使用标准库模块
import math
from random import Random

radius = 3
area = math.pi * radius ** 2

# 独立随机数生成器便于复现结果
rng = Random(42)
sample = rng.randint(1, 10)

print(f"圆面积：{area:.2f}")
print("随机整数：", sample)
```

> **易错点** 
> 不推荐 `from module import *`，因为来源不清且容易发生名称冲突。脚本名不要写成 `random.py`、`math.py` 等标准库名称，否则可能导入自己的文件。遇到 `ModuleNotFoundError` 时先确认包是否安装在当前运行脚本所用的解释器中。

### 面向对象的核心概念

**核心概念** 

面向对象把相关数据和操作数据的行为组合在对象中。类是创建对象的规则，对象（实例）是按规则产生的具体实体。属性保存状态，方法描述行为。封装用于把实现细节收拢在类中；继承用于复用和扩展已有类；多态表示不同对象能以统一接口响应同一种操作。

**语法格式与代码示例** 

```python
# 同一接口作用于不同对象，体现简单多态
class Cat:
    def speak(self) -> str:
        return "喵"


class Dog:
    def speak(self) -> str:
        return "汪"


animals = [Cat(), Dog()]
for animal in animals:
    print(animal.speak())
```

> **使用判断** 
> 不是所有程序都需要类。一次性的纯计算通常用函数更简单；当多个数据必须保持一致，并且围绕这些数据存在一组稳定行为时，类更有价值。学习算法时应先写清数据结构和步骤，不必为了“面向对象”强行增加类。

### 类、实例与初始化

**核心概念** 

使用 `class` 定义类，调用类名会创建实例。`__init__()` 在实例创建后负责初始化属性，`self` 指向当前实例。实例属性通常写成 `self.属性 = 值`，每个对象都有各自的数据。类名采用大驼峰命名，实例名仍使用小写加下划线。

**语法格式** 

```python
class Student:
    def __init__(self, name: str, score: float) -> None:
        self.name = name
        self.score = score


student_a = Student("小林", 92)
student_b = Student("小周", 85)

print(student_a.name, student_a.score)
print(student_b.name, student_b.score)
```

> **易错点** 
> 实例方法定义中的第一个参数必须接收当前实例，惯例命名为 `self`；调用 `student_a.method()` 时 Python 会自动传入它。`__init__` 前后各有两个下划线，不应拼错。`__init__` 通常不返回其他值，只负责建立有效的初始状态。

### 属性与实例方法

**核心概念** 

实例方法通过 `self` 读取或修改对象属性，使数据和行为保持在同一处。对象状态应尽量由方法维护，避免外部代码随意制造无效值。可以在初始化或更新方法中校验数据。以下示例把成绩合法性检查集中在类内，并提供判断及格和显示信息的方法。

**语法格式与代码示例** 

```python
class Student:
    def __init__(self, name: str, score: float) -> None:
        self.name = name
        self.update_score(score)

    def update_score(self, score: float) -> None:
        if not 0 <= score <= 100:
            raise ValueError("成绩必须在 0～100 之间")
        self.score = score

    def is_passed(self) -> bool:
        return self.score >= 60

    def describe(self) -> str:
        return f"{self.name}：{self.score} 分"


student = Student("小林", 88)
student.update_score(93)
print(student.describe(), student.is_passed())
```

> **易错点** 
> 调用方法要使用圆括号：`student.is_passed()` 得到结果，`student.is_passed` 只是方法对象。不要在方法中遗漏 `self.`，否则创建的是局部变量，不会更新实例属性。

### 继承与方法重写

**核心概念** 

继承允许子类复用父类的属性和方法，并添加新能力。定义形式是 `class 子类(父类)`。子类的 `__init__()` 可用 `super().__init__()` 完成父类初始化；当子类定义同名方法时，会重写父类行为。继承表达“是一个”的关系，若只是“拥有一个”对象，组合通常更合适。

**语法格式与代码示例** 

```python
class Animal:
    def __init__(self, name: str) -> None:
        self.name = name

    def speak(self) -> str:
        return "未知声音"


class Dog(Animal):
    def __init__(self, name: str, breed: str) -> None:
        super().__init__(name)
        self.breed = breed

    def speak(self) -> str:
        return "汪"


dog = Dog("豆豆", "柯基")
print(dog.name, dog.breed, dog.speak())
print(isinstance(dog, Animal))
```

> **易错点** 
> 子类重写 `__init__()` 后不会自动执行父类初始化，需要显式调用 `super()`。不要建立过深继承层次；当复用只是为了调用某个工具对象时，优先把它作为属性组合进来。

## 文件路径、读写与异常

### 文件路径

**核心概念** 

文件路径描述文件在文件系统中的位置。绝对路径从磁盘或根目录开始，完整但不便迁移；相对路径以程序当前工作目录为基准，更适合项目内部文件。`pathlib.Path` 能以跨平台方式拼接、检查和规范处理路径，比手写斜杠更可靠。

**语法格式** 

```python
from pathlib import Path

# 构造跨平台路径，不要求目标必须存在
project_dir = Path.cwd()
data_dir = project_dir / "data"
score_file = data_dir / "scores.csv"

print("工作目录：", project_dir)
print("数据文件路径：", score_file)
print("文件名：", score_file.name)
print("扩展名：", score_file.suffix)
print("是否为绝对路径：", score_file.is_absolute())
```

> **易错点** 
> 相对路径取决于“从哪里启动程序”，不一定取决于 `.py` 文件所在位置。Windows 路径中的反斜杠可能被当作转义字符，优先使用 `Path` 或原始字符串。不要把只适用于自己电脑的绝对路径写死在可复用代码中。

### 读取文件

**核心概念** 

`open()` 用于打开文件，读取模式是 `"r"`。`with` 语句会在代码块结束后自动关闭文件，即使中途出现异常也能释放资源。`read()` 读取全部内容，`readline()` 读取一行，直接遍历文件对象适合逐行处理大文件。文本文件应明确指定编码，中文通常使用 UTF-8。

**语法格式** 

```python
from pathlib import Path
from tempfile import TemporaryDirectory

# 示例在临时目录中创建并读取文件，可独立运行
with TemporaryDirectory() as directory:
    path = Path(directory) / "scores.txt"
    path.write_text("小林,92\n小周,85\n", encoding="utf-8")

    with path.open("r", encoding="utf-8") as file:
        for line in file:
            name, score = line.strip().split(",")
            print(name, int(score))
```

> **易错点** 
> `read()` 执行后文件指针位于末尾，再读会得到空字符串；需要重读可重新打开文件或使用 `seek(0)`。逐行读取时通常用 `strip()` 去掉行尾换行，但若首尾空格本身有意义，应改用 `rstrip("\n")`。

### 写入文件

**核心概念** 

写入模式 `"w"` 会创建文件或清空已有内容，追加模式 `"a"` 会把新内容放到末尾。`write()` 不会自动添加换行，需要显式写入 `\n`；`writelines()` 也不会替每项补换行。保存结构化数据时要稳定规定字段顺序和编码，读取端使用相同规则。

**语法格式** 

```python
from pathlib import Path
from tempfile import TemporaryDirectory

with TemporaryDirectory() as directory:
    path = Path(directory) / "notes.txt"

    with path.open("w", encoding="utf-8") as file:
        file.write("第一条记录\n")

    with path.open("a", encoding="utf-8") as file:
        file.write("第二条记录\n")

    print(path.read_text(encoding="utf-8"))
```

> **易错点** 
> 对重要文件使用 `"w"` 前要确认是否允许覆盖。读写模式不是文件扩展名：`.csv` 仍是文本文件，只是内容遵循逗号分隔规则。真实程序可先写入临时文件，完成后再替换目标，以降低写到一半导致文件损坏的风险。

### 异常处理

**核心概念** 

异常表示程序运行时发生了无法按正常流程完成的情况。`try` 放可能失败的操作，`except` 处理指定异常，`else` 在未发生异常时执行，`finally` 无论是否异常都会执行。应捕获能够合理处理的具体异常；无法恢复时让异常继续传播，或使用 `raise` 主动报告无效状态。

**语法格式** 

```python
def safe_divide(left_text: str, right_text: str) -> float | None:
    try:
        left = float(left_text)
        right = float(right_text)
        result = left / right
    except ValueError:
        print("输入必须是数字")
        return None
    except ZeroDivisionError:
        print("除数不能为零")
        return None
    else:
        return result
    finally:
        print("本次计算结束")


print(safe_divide("12", "3"))
print(safe_divide("12", "0"))
```

> **易错点** 
> 不要用空的 `except:` 静默吞掉所有错误，这会隐藏编程缺陷。`try` 块应尽量小，只包住真正可能失败的语句。异常信息应说明失败原因，不要把密码、令牌或其他敏感数据完整写进日志。

## 测试、高阶函数与练习方向

### 测试基础与 assert

**核心概念** 

测试通过固定输入检查程序是否得到预期输出，帮助发现回归错误。基本流程可概括为“准备数据—执行操作—断言结果”。测试应覆盖正常情况、边界值和预期异常。`assert` 适合学习阶段和测试代码中的快速断言，不应替代正式输入校验，因为优化运行时断言可能被禁用。

**语法格式与代码示例** 

```python
def classify_score(score: int) -> str:
    if not 0 <= score <= 100:
        raise ValueError("成绩超出范围")
    return "及格" if score >= 60 else "不及格"


# 正常值和边界值测试
assert classify_score(100) == "及格"
assert classify_score(60) == "及格"
assert classify_score(59) == "不及格"

try:
    classify_score(101)
except ValueError:
    pass
else:
    raise AssertionError("101 分应触发 ValueError")

print("全部断言通过")
```

> **易错点** 
> 只测试一个正常样例远远不够，边界通常最容易出错。测试失败时先确认需求和期望值是否正确，再判断实现问题；不要为了让测试变绿而随意修改正确的业务规则。

### 使用 unittest 组织测试

**核心概念** 

`unittest` 是 Python 标准库中的测试框架。测试类继承 `unittest.TestCase`，测试方法名以 `test_` 开头。框架自动发现测试并报告通过、失败或错误。常用断言包括 `assertEqual()`、`assertTrue()` 和 `assertRaises()`；重复准备工作可放进 `setUp()`。

**语法格式与代码示例** 

```python
import unittest


def add_tax(price: float, rate: float = 0.06) -> float:
    if price < 0:
        raise ValueError("价格不能为负数")
    return price * (1 + rate)


class AddTaxTests(unittest.TestCase):
    def test_default_rate(self) -> None:
        self.assertAlmostEqual(add_tax(100), 106.0)

    def test_zero_price(self) -> None:
        self.assertEqual(add_tax(0), 0)

    def test_negative_price(self) -> None:
        with self.assertRaises(ValueError):
            add_tax(-1)


if __name__ == "__main__":
    unittest.main()
```

> **易错点** 
> 浮点数比较宜用 `assertAlmostEqual()`，不要直接要求所有小数位完全一致。测试之间应相互独立，不能依赖执行顺序。测试名称要表达场景和期望行为，便于失败时迅速定位。

### 高阶函数与 lambda

**核心概念** 

Python 中函数也是对象，可以赋给变量、作为参数传入或作为返回值传出。接收函数或返回函数的函数称为高阶函数。`lambda 参数: 表达式` 创建一个仅包含单个表达式的匿名函数，常用于 `sorted()` 的 `key`、`map()` 和 `filter()` 等需要简短回调的场景。

**语法格式与代码示例** 

```python
# 使用函数作为排序规则
students = [
    {"name": "小林", "score": 88},
    {"name": "小周", "score": 95},
    {"name": "小吴", "score": 76},
]

ordered = sorted(students, key=lambda item: item["score"], reverse=True)
passed_names = [item["name"] for item in students if item["score"] >= 60]

print(ordered)
print(passed_names)
```

> **易错点** 
> `lambda` 只能写一个表达式，复杂逻辑应定义普通函数并写清名称。对于简单筛选和转换，列表推导式通常比嵌套 `map()`、`filter()` 更易读。传递函数时写函数名 `key=rule`，写成 `key=rule()` 会提前调用并传递返回值。

### 从基础走向算法与应用

**核心概念** 

完成基础语法后，下一阶段应从“继续看”转为“持续写”。算法学习重点是数据结构、问题分解、复杂度和边界测试；应用学习则要逐步接触项目结构、虚拟环境、第三方库、数据持久化和调试工具。遇到陌生语法先查本笔记，再查 Python 官方文档，并用最小代码验证理解。

**推荐路径** 

1. 熟练使用字符串、列表、字典、集合和函数解决小问题。
2. 学习排序、查找、递归、栈、队列、哈希表等算法基础。
3. 选择一个应用方向：数据分析、自动化、Web、GIS 或机器学习。
4. 用小项目串联文件、异常、模块、测试和第三方库。

**语法格式与代码示例** 

```python
def main() -> None:
    """程序入口：后续项目可以从这一结构扩展。"""
    data = [3, 1, 4, 1, 5]
    print("排序结果：", sorted(data))


if __name__ == "__main__":
    main()
```

> **学习判断** 
> 能看懂示例不等于能够独立编程。真正掌握的标准是：不看答案完成一个小功能，能解释每一步，能根据报错定位问题，并能为边界情况补充测试。

## Python 语法速查表

**输入、输出与类型** 

| 需求 | 写法 | 说明 |
|---|---|---|
| 输出 | `print(value)` | 默认末尾换行 |
| 多项输出 | `print(a, b, sep=",")` | `sep` 控制分隔符 |
| 获取输入 | `text = input("提示：")` | 返回值一定是字符串 |
| 查看类型 | `type(value)` | 返回类型对象 |
| 类型判断 | `isinstance(value, int)` | 程序判断时更常用 |
| 转整数 | `int(text)` | 文本必须符合整数格式 |
| 转浮点数 | `float(text)` | 文本必须符合数字格式 |
| 转字符串 | `str(value)` | 便于拼接或保存 |

**运算与判断** 

| 需求 | 写法 |
|---|---|
| 加、减、乘、除 | `+`、`-`、`*`、`/` |
| 整除、取余、幂 | `//`、`%`、`**` |
| 相等、不等 | `==`、`!=` |
| 大小比较 | `<`、`<=`、`>`、`>=` |
| 逻辑与、或、非 | `and`、`or`、`not` |
| 区间判断 | `0 <= score <= 100` |
| 成员判断 | `item in container` |
| 身份判断 | `value is None` |

**控制结构** 

```python
condition = False
other_condition = False
iterable = []

if condition:
    pass
elif other_condition:
    pass
else:
    pass

for item in iterable:
    pass

while condition:
    pass
```

**常用容器** 

| 类型 | 创建 | 常用操作 |
|---|---|---|
| 列表 | `items = []` | `append`、`extend`、`pop`、切片、`sorted` |
| 元组 | `point = (1, 2)` | 索引、解包；不可修改 |
| 字典 | `data = {}` | `get`、`items`、`keys`、`values`、`pop` |
| 集合 | `seen = set()` | `add`、`remove`、交并差运算 |
| 字符串 | `text = "Python"` | `strip`、`split`、`join`、`replace`、切片 |

> **补充说明** 
> 视频主线重点介绍列表和字典；元组与集合在此速查表中只作为后续算法学习所需的基础入口。元组适合固定记录，集合适合去重和快速成员判断。

**函数** 

```python
def function_name(required, optional=None):
    """一句话说明函数职责。"""
    if optional is None:
        optional = []
    result = required
    return result
```

**字符串格式化** 

| 需求 | 写法 | 示例结果 |
|---|---|---|
| 插入变量 | `f"姓名：{name}"` | `姓名：小林` |
| 两位小数 | `f"{value:.2f}"` | `3.14` |
| 千位分隔 | `f"{value:,}"` | `1,000,000` |
| 右对齐 | `f"{text:>10}"` | 宽度不足时左侧填空格 |
| 居中 | `f"{text:^10}"` | 两侧填充 |

**文件与异常** 

```python
from pathlib import Path

path = Path("data.txt")

try:
    with path.open("r", encoding="utf-8") as file:
        content = file.read()
except FileNotFoundError:
    content = ""

print(content)
```

**类与测试** 

```python
import unittest


class Counter:
    def __init__(self) -> None:
        self.value = 0

    def increase(self) -> None:
        self.value += 1


class CounterTests(unittest.TestCase):
    def test_increase(self) -> None:
        counter = Counter()
        counter.increase()
        self.assertEqual(counter.value, 1)


if __name__ == "__main__":
    unittest.main()
```


## 后续练习与来源

先尝试独立完成一个小功能，再检查边界条件。可以按下面的顺序继续：

1. [文件路径与工作目录](https://yuanzhibx.github.io/coding/python-file-paths/)：解决程序找不到文件的问题。
2. [CSV 读取与保存](https://yuanzhibx.github.io/coding/python-csv-basics/)：把文本字段转换为可计算数据。
3. [平均值、中位数和样本标准差](https://yuanzhibx.github.io/coding/python-basic-statistics/)：用函数完成统计并核对结果。
4. [英文词频统计](https://yuanzhibx.github.io/coding/python-word-frequency/)：练习字符串处理、计数与排序。

本文保留原笔记的学习主线，并将 Obsidian 提示框和内部链接改为网站可读形式。原学习来源为 [《3小时超快速入门 Python｜动画教学》](https://www.bilibili.com/video/BV1Jgf6YvE8e/)，不是视频逐字稿。语法与标准库用法可继续查阅 [Python 官方教程](https://docs.python.org/3/tutorial/)；示例为学习材料中的独立演示，不代表真实业务规则。
