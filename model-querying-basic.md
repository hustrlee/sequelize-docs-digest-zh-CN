# Model 的基本 CRUD 操作

本节介绍如何实现标准的 CRUD 操作。

> **重要！**CRUD 是数据库操作的基本操作，但是作为产品级的软件系统，应该使用事务（Transactions）来保证数据的完整性。请阅读 [事务操作指南](./transactions.md) 来了解如何在 Sequelize 中使用事务。



## 简单的插入（INSERT）

```javascript
const jane = await User.create({ firstName: "Jane", lastName: "Doe" });
console.log("Jane's auto-generated ID: ", jane.id);
```



## 简单的查询（SELECT）

```javascript
const users = await User.findAll();
console.log("All users: ", JSON.stringify(users, null, 2));
```

`findAll` 返回一个数组，包括了数据库表中的所有数据。



## 简单的更新（UPDATE）

```javascript
// 把 firstName = "Jane" 的行中 lastName 更新为 "Doe"
await User.update({ lastName: "Doe" }, { where: { firstName: "Jane" } });
```



## 简单的删除（DELETE）

```javascript
// 删除 firstName = "Jane" 的行
await User.destroy({ where: { firstName: "Jane" } });

// 用 SQL 语句 TRUNCATE 删除所有行
await User.destroy({ truncate: true });
```



## 指定 SELECT 查询的属性

本节的例子，基于以下数据库表：

| id   | firstName | lastName | createdAt           | updatedAt           |
| ---- | --------- | -------- | ------------------- | ------------------- |
| 1    | Richard   | Public   | 2020-02-28 21:39:31 | 2020-02-28 21:39:31 |
| 2    | Jane      | Doe      | 2020-02-28 21:39:31 | 2020-02-28 21:39:31 |

> **注意：**官方文档的例子在 MySQL 5.7/MySQL 8 上并不能正确执行，因为 MySQL 5.7 以上版本的默认查询模式是：only_full_group_by。

```javascript
// 只查询 id、firstName 两个字段
// SELECT id, firstName FROM Users;
users = User.findAll({
  attributes: ["id", "firstName"]
})；

// 将 lastName 字段查询结果重命名为 familyName
// SELECT firstName, lastName AS familyName FROM Users;
users = User.findAll({
  attributes: ["firstName", ["lastName", "familyName"]]
});
// users = [{ firstName: "Richard", familyName: "Public"}, ...]

// 使用聚合函数示例。官方示例在 MySQL 5.7 以上版本不正确，不可以将非 GROUP BY 的字段和聚合函数一起使用
// SELECT GROUP_CONCAT(firstName) AS concat, COUNT(id) AS total_user FROM Users;
users = User.findAll({
  attributes: [
    [sequelize.fn("GROUP_CONCAT", sequelize.col("firstName")), "concat"],
    [sequelize.fn("COUNT", sequelize.col("id")), "total_user"]
  ]
});
// users = { concat: "Richard,Jane", total_user: 2 }
// 同理：官方示例中的 include 示例会报错

users = User.findAll({
  attributes: {
    exclude: ["createdAt", "updatedAt"] // 不显示 createdAt 和 updatedAt 两个字段
  }
})；
```



## 使用 WHERE

`where` 有很多运算符，可以从 `Op` 中以符号的方式来引用。

 ### 基本使用方法

```javascript
// SELECT * FROM post WHERE authorId = 2 AND age IN (25, 26, 27) AND status = 'active';
Post.findAll({
  where: {
    authorId: 2,
    age: [25, 26, 27],
    status: "active"
  }
});

// 使用 Op 实现更复杂的逻辑
// SELECT * FROM post WHERE authorId = 2 OR authorId = 3;
const { Op } = require("sequelize");
Post.findAll({
  where: {
    [Op.or]: [
      { authorId: 2 },
      { authorId: 3 }
    ]
  }
});

// 以上逻辑，也可以简写为：
Post.findAll({
  where: {
    authorId: {
      [Op.or]: [2, 3]
    }
  }
});
```

### 运算符详解

```javascript
const { Op } = require("sequelize");
Post.findAll({
  where: {
    [Op.and]: [{ a: 5 }, { b: 6 }],            // (a = 5) AND (b = 6)
    [Op.or]: [{ a: 5 }, { b: 6 }],             // (a = 5) OR (b = 6)
    someAttribute: {
      // Basics
      [Op.eq]: 3,                              // = 3
      [Op.ne]: 20,                             // != 20
      [Op.is]: null,                           // IS NULL
      [Op.not]: true,                          // IS NOT TRUE
      [Op.or]: [5, 6],                         // (someAttribute = 5) OR (someAttribute = 6)

      // Number comparisons
      [Op.gt]: 6,                              // > 6
      [Op.gte]: 6,                             // >= 6
      [Op.lt]: 10,                             // < 10
      [Op.lte]: 10,                            // <= 10
      [Op.between]: [6, 10],                   // BETWEEN 6 AND 10
      [Op.notBetween]: [11, 15],               // NOT BETWEEN 11 AND 15

      // Other operators

      [Op.all]: sequelize.literal('SELECT 1'), // > ALL (SELECT 1)

      [Op.in]: [1, 2],                         // IN [1, 2]
      [Op.notIn]: [1, 2],                      // NOT IN [1, 2]

      [Op.like]: '%hat',                       // LIKE '%hat'
      [Op.notLike]: '%hat',                    // NOT LIKE '%hat'
      [Op.startsWith]: 'hat',                  // LIKE 'hat%'
      [Op.endsWith]: 'hat',                    // LIKE '%hat'
      [Op.substring]: 'hat',                   // LIKE '%hat%'
      [Op.regexp]: '^[h|a|t]',                 // REGEXP/~ '^[h|a|t]'
      [Op.notRegexp]: '^[h|a|t]',              // NOT REGEXP/!~ '^[h|a|t]'
    }
  }
});
```

### 逻辑组合

运算符 `Op.and`、`Op.or`、`Op.not` 可以组成任意复杂的、嵌套的逻辑表达式。

