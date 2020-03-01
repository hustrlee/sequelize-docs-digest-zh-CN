# 校验和约束

本节学习如何在 model 中使用校验和约束。

本节的例子，使用以下的数据库表配置：

```javascript
const { Sequelize, Op, Model, DataTypes } = require("sequelize");
const sequelize = new Sequelize("mysql://root:root@127.0.0.1/db");

const User = sequelize.define("User", {
  username: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  hashedPassword: {
    type: DataTypes.STRING(64),
    is: /^[0-9a-f]{64}$/i
  }
});

(async () => {
  await sequelize.sync({ force: true });
  // 后续代码
})();
```



## 校验和约束的区别

验证（Validations）是 Sequelize 级别的、纯 Javascript 实现。它能实现非常灵活、非常复杂的数据验证。如果验证失败，Sequelize 不会向数据库发送任何的 SQL 语句。

约束则是 SQL 级别的。最常用的基本约束是唯一性（unique）约束。如果无法通过约束校验，数据库会抛出一个错误，Sequelize 会将这个错误转发给 Javascript。注意：这里有 SQL 语句被执行，验证的处理方式不同。



## 唯一性约束

