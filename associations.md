# 关联

Sequelize 支持的标准关联：One-To-One、One-To-Many、和 Many-To-Many。

为了实现标准关联，Sequelize 提供了 4 种关联类型：

- `HasOne`
- `BelongsTo`
- `HasMany`
- `BelongsToMany`

本节解释如何使用这 4 种关联类型，以及如何组合它们来实现 3 种标准关联类型。



## 定义 Sequelize 关联

