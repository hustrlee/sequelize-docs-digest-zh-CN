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

> **注意：**官方文档的例子在 MySQL 5.7/MySQL 8 上并不能正确执行，因为 MySQL 5.7 以上版本的默认查询模式是：ONLY_FULL_GROUP_BY。这里，对这些例子进行了改写。

```javascript

```

