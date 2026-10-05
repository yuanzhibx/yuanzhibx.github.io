---
title: '机器学习入门：从数据、模型到一次完整的分类实践'
summary: '用鸢尾花分类认识特征、标签、训练与泛化，运行一个包含数据划分、标准化、基线比较和误差检查的 Python 示例。'
date: '2026-10-05'
section: coding
type: article
tags: [Python, 机器学习, scikit-learn]
featured: false
draft: false
---

## 从一个具体问题开始

假设有一批鸢尾花，每朵花都测量了花萼长度、花萼宽度、花瓣长度和花瓣宽度，也知道它属于哪个品种。现在拿到一朵没有标明品种的花，能否根据这四个测量值预测它的类别？

可以人工编写规则，例如“花瓣短于某个数值就归为某类”，也可以让算法根据已有样本拟合一套分类规则。后一种做法就是机器学习的一种典型应用。

这里的“学习”有明确的计算含义：算法利用训练数据调整模型的参数，使预测与已知答案尽可能一致。真正关心的，是这套规则在未参与训练的数据上是否依然有效，这种能力称为泛化。

本文用 scikit-learn 自带的 Iris 数据集演示全过程。这是公开教学数据，不是个人采样或农业试验结果。

## 样本、特征与标签

在表格数据中，一行通常对应一个样本，一列输入变量对应一个特征。标签则是希望模型预测的答案。

| 概念 | 鸢尾花例子 | 代码中的表示 |
| --- | --- | --- |
| 样本 | 一朵被测量的花 | `X` 的一行 |
| 特征 | 四项长度、宽度测量值 | `X` 的四列 |
| 标签 | 已知的品种类别 | `y` 中的一个值 |
| 模型 | 测量值到类别的映射 | 拟合后的分类器 |
| 预测 | 判断新样本属于哪类 | `model.predict(X_new)` |

Iris 包含 150 个样本、4 个数值特征和3个类别，每类50个样本。类别在程序里编码为0、1、2，这些数字只是类别编号，没有大小或距离含义。数据字段可在 [Iris 官方说明](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_iris.html) 中核对。

换成农业问题时，样本可能是一块地，特征可能是光谱指数、地形或气象变量，标签可能是作物类型或实测产量。首先要明确每一行对应什么对象、输入在实际预测时能否获得。

## 机器学习不只是一种算法

监督学习使用带答案的数据。预测有限类别属于分类，例如识别作物类型；预测连续数值属于回归，例如估算产量。无监督学习通常不提供这样的目标标签，而是探索数据结构，例如聚类。强化学习则围绕智能体的连续决策与奖励展开，本文不展开。

深度学习是机器学习中的一类方法，使用多层神经网络学习表示与预测关系。机器学习还包括线性模型、决策树、随机森林等方法。YOLO 目标检测模型属于深度学习应用，但并不是所有机器学习问题都需要神经网络。

本例使用逻辑回归。虽然名字里有“回归”，它在这里执行分类：根据特征计算各类别的概率估计，再选择预测类别。这些估计是否校准准确，还需要额外评估。参数和接口见 [LogisticRegression 文档](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html)。

## 为什么要把数据分开

如果训练时已经看过所有答案，再用同一批数据打分，就无法判断模型面对新样本的表现。常见的数据分工是：

| 数据部分 | 主要作用 | 需要避免的操作 |
| --- | --- | --- |
| 训练集 | 拟合模型及预处理参数 | 混入测试信息 |
| 验证集或交叉验证 | 比较方案、选择超参数 | 反复挑选后仍把分数当作最终结论 |
| 测试集 | 方案确定后的最终评估 | 根据测试分数持续改模型 |

本例固定一个简单方案，不做超参数搜索，因此只划分训练集与测试集。如果后续开始比较很多模型，就应在训练部分增加交叉验证，最后再使用测试集。详见 [scikit-learn 的交叉验证指南](https://scikit-learn.org/stable/modules/cross_validation.html)。

标准化也会从数据中学习均值和标准差。因此要先划分，再只在训练集上拟合标准化器。使用 `Pipeline` 可以把标准化和分类器放进同一条处理流程，减少误把测试数据用于拟合的机会。[官方常见错误指南](https://scikit-learn.org/stable/common_pitfalls.html) 对这种数据泄漏有具体演示。

## 准备运行环境

下面的终端命令适用于 macOS 或 Linux。创建独立目录和虚拟环境，让练习依赖与其他项目分开。Windows 的虚拟环境激活命令不同。

```bash
mkdir -p ml-iris-demo
cd ml-iris-demo
python3 -m venv .venv
source .venv/bin/activate
python -m pip install scikit-learn
```

安装依赖需要联网。Iris 数据随 scikit-learn 提供，运行下面的脚本不需要另外下载数据。

## 完整 Python 示例

在刚才的目录中创建 `iris_demo.py`，写入以下代码。不要把文件命名为 `sklearn.py`，否则可能遮蔽同名库。

```python
import sklearn
from sklearn.datasets import load_iris
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler


def main():
    iris = load_iris()
    X, y = iris.data, iris.target

    # 固定随机种子，并尽量保持各类别在两部分中的比例
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 标准化器只从训练集学习均值和标准差
    model = make_pipeline(
        StandardScaler(),
        LogisticRegression(max_iter=1000),
    )
    model.fit(X_train, y_train)
    predicted = model.predict(X_test)

    # 建立不利用特征的简单基线，检查模型是否学到有用关系
    baseline = DummyClassifier(strategy="most_frequent")
    baseline.fit(X_train, y_train)
    baseline_predicted = baseline.predict(X_test)

    print(f"scikit-learn 版本：{sklearn.__version__}")
    print(f"训练样本：{len(y_train)}，测试样本：{len(y_test)}")
    print(f"基线准确率：{accuracy_score(y_test, baseline_predicted):.3f}")
    print(f"模型准确率：{accuracy_score(y_test, predicted):.3f}")
    print("混淆矩阵（行是真实类别，列是预测类别）：")
    print(confusion_matrix(y_test, predicted, labels=[0, 1, 2]))
    print(classification_report(
        y_test, predicted, labels=[0, 1, 2],
        target_names=iris.target_names, digits=3, zero_division=0
    ))

    # 按原始特征顺序输入，单位均为厘米；这是人为构造的演示样本
    new_sample = [[5.1, 3.5, 1.4, 0.2]]
    category = int(model.predict(new_sample)[0])
    print(f"演示样本的预测类别：{iris.target_names[category]}")

    # 查看误判对象；没有误判也不代表模型适用于所有真实数据
    for index, (actual, guess) in enumerate(zip(y_test, predicted)):
        if actual != guess:
            print(
                f"测试样本 {index}：真实={iris.target_names[actual]}，"
                f"预测={iris.target_names[guess]}，特征={X_test[index].tolist()}"
            )


if __name__ == "__main__":
    main()
```

运行并记录当前依赖版本：

```bash
python iris_demo.py
python -m pip freeze > requirements.txt
```

`fit()` 使用训练数据拟合参数，`predict()` 对输入产生预测。对新样本预测时，流水线会自动使用训练阶段保存的标准化参数，不需要再次调用 `fit()`。这两个阶段的区别也见 [scikit-learn 入门文档](https://scikit-learn.org/stable/getting_started.html)。

## 读懂分数，而不只看一个数

本文示例于2026年10月5日在 Apple Silicon Mac 上运行核对，环境为 Python 3.14.3、scikit-learn 1.9.1。主要输出如下：

```text
训练样本：120，测试样本：30
基线准确率：0.333
模型准确率：0.933
混淆矩阵（行是真实类别，列是预测类别）：
[[10  0  0]
 [ 0  9  1]
 [ 0  1  9]]
演示样本的预测类别：setosa
```

这次测试有28个样本预测正确，两个错误发生在 versicolor 与 virginica 之间。它是上述固定划分的实际运行结果，不是对所有数据划分或实际应用精度的保证。安装命令不固定版本，后续依赖更新可能使结果或输出格式变化；复现时应同时记录自己的环境。

准确率等于预测正确的样本数除以总样本数。混淆矩阵的对角线表示预测正确的数量，非对角线表示错分方向。例如，第二行第三列有一个数，就表示有相应数量的第二类样本被预测成第三类。

分类报告中的 Precision 表示“预测为某类的样本中，有多少确实属于这一类”；Recall 表示“真正属于某类的样本中，有多少被找到了”；F1 是两者的调和平均，`support` 是该类的真实样本数。

如果某个数据集有95%的样本属于同一类，那么始终预测这一类也能获得95%的准确率，却可能完全找不到少数类。因此脚本额外提供了始终预测训练集最常见类别的基线，并打印各类指标。基线接口见 [DummyClassifier 文档](https://scikit-learn.org/stable/modules/generated/sklearn.dummy.DummyClassifier.html)。

本例测试集只有30个样本。即使某次全部预测正确，也只能说明在这次划分上表现良好，不能证明真实任务中不会出错。不同数据划分、测量误差和数据来源变化，都可能改变结果。

## 从练习走向实际问题

过拟合是模型过度适应训练数据中的细节，导致面对新数据时表现下降。训练分数高而验证分数明显较低，是需要检查的信号；但分数差异也可能来自样本太少或数据分布变化，不能只凭一个现象下结论。

农业和遥感任务还需要检查样本之间的关联。如果同一地块的相邻像元、同一植株的多张照片同时进入训练集和测试集，评估可能过于乐观。依据实际使用目标按地块、采集批次或时间分组划分，是把通用验证原则应用到这些任务中的一种方式；具体分组单位需要根据研究设计确定。

下一步练习可以在训练部分加入交叉验证，观察不同划分的分数波动，再尝试另一个分类器。保留数据来源、划分方法、随机种子和依赖版本，比只保存一个最高分更有助于复现结果。
