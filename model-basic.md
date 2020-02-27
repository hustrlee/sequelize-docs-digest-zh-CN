# Model 基础

本节学习 Sequelize 中 Model 概念，及基本使用方法。



## 概念

Model 是 Sequelize 的核心设计理念，它是数据库表在 Sequelize 中的数据对象抽象。Model 是一个类，它从 Sequelize 中的 Model 类派生出来，用于描述数据库中某张表的名称、字段、及字段的数据类型等。

每个 Model 有一个名称，这个名称不必与它在数据库表中表示的表的名称相同。通常，在不做特别指定的时候，模型具有单数名称（例如：`User`），而对应的表具有复数名称（例如：`Users`）。当然，也可以显示的指定 Model 对应的表名称。



## Model 定义

为以下的 `Users` 表定义一个 Model：

| 字段名称  | 类型         | NULL | 默认值 | 备注 |
| --------- | ------------ | ---- | ------ | ---- |
| firstName | VARCHAR(255) |      |        |      |
| lastName  | VARCHAR(255) | Null |        |      |

Sequelize 中有两种等效的方式定义 Model：

- 调用 `sequelize.define(modelName, attributes, options)`
- 从 Model 类派生，并调用 `init(attributes, options)`



### 使用 `sequelize.define`

```javascript
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("mysql://root:12345@localhost:3306/dbtest");

// Model 是一个类，根据驼峰命名规范，首字母大写
const User = sequelize.define("User", { // Model 名称为 User，对应的表名称为 Users
  firstName: {
    type: DataTypes.STRING, // DataTypes.STRING = VARCHAR(255)
    allowNull: false // 不允许为 NULL
  },
  lastName: {
    type: DataTypes.STRING,
    // allowNull 缺省值为 true
  }
});
```



### 从 Mode 类派生

```javascript
const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = new Sequelize("mysql://root:12345@localhost:3306/dbtest");

class User extends Model {}

User.init(
  {
  	firstName: {
    	type: DataTypes.STRING,
    	allowNull: false
  	},
  	lastName: {
    	type: DataTypes.STRING
  	}
	},
  {
  	sequelize, // 需要将 Model - User 与数据库连接实例 sequelize 关联起来
  	modelName: "User", // Model 的名称
  	tableName: "Users" // 显式的指定关联的数据库表名称
	}
);
```



## 数据表名称的推断

定义 Model 时，不需要指定对应的数据表名，Sequelize 会自动推断对应的表名。

- 在缺省的情况下，Seuqelize 会自动将 Model 名的复数形式作为数据表名。“复数推断”是通过一个称为 [inflection](https://www.npmjs.com/package/inflection) 的库在后台进行的，它还能正确推断不规则复数形式（例如：person 的复数推断为 people）。
- 可以使用 `freezeTableName` 选项，强制数据表名和 Model 名相同。
- 可以显式的直接指定数据表名。



### 强制数据表名等于 Model 名

```javascript
const User = sequelize.define(
  "User", // Model名
  {
  	firstName: {
    	type: DataTypes.STRING,
    	allowNull: false
  	},
  	lastName: {
    	type: DataTypes.STRING
  	}
	},
  {
    freezeTableName: true // 数据表名 = Model名 = User
  }
);
```



### 显式的直接指定数据表名

```java
const User = sequelize.define(
  "User", // Model名
  {
  	firstName: {
    	type: DataTypes.STRING,
    	allowNull: false
  	},
  	lastName: {
    	type: DataTypes.STRING
  	}
	},
  {
    tableName: "Employees" // 数据表名 = Employees
  }
);
```



### 数据表名自动推断的思维逻辑

数据表名的自动推断规则是符合逻辑的：

- `Users` 数据表里每一行数据（row）对应了一个 `user`。
- `user` 是 Sequelize 中 `User` 模型（Model） 的实例（instance）。
- `User` 是一个 类，是实例 `user` 的抽象。

因此，“推断数据表是 Model 名复数形式”是符合思维逻辑的。当然，显式的指定数据库表名，能减少歧义、更容易阅读、维护代码。



## Model 的同步

将一个 Model 与数据库进行同步，实质上就是根据 Model 的定义在数据库中建表。

> **注意！**这里的所说的同步是**单向**的，只能将 Model 的定义同步到数据库（建表），而不能将数据表结构同步回 Model。

调用 `model.sync(options)` 来执行同步。有三种同步方式：

- `User.sync()` - 如果数据表不存在，则创建数据表；如果存在，则什么事儿不做。
  - 实质上是执行 SQL 语句：`CREATE TABLE IF NOT EXISTS 'Users'`
- `User.sync({ force: true })` - 如果数据表不存在，则创建数据表；如果存在，则先删除数据表，再创建它。
  - 实质上是先执行 `DROP TABLE`，再执行 `CREATE TABLE`。
- `User.sync({ alter: true })` - 如果数据表不存在，则创建数据表；如果存在，则修改数据表结构以保证它与 Model 相符。
  - 实质上是执行 `ALTER TABLE`。
  - `alter` 和 `force` 的不同在于：`alter` 改变表结构，但是会保留原有的数据（当然，被删除字段的数据永久消失了）；`force` 先删除表，所有的数据都永久的删除了。



### 一次性同步所有的 Model

```javascript
await sequelize.sync({ force: true }); // 一次性同步 sequelize 中已定义的所有 Model
```



### 删除数据表

```javascript
await User.drop(); // 删除 Users 数据表
await sequelize.drop(); // 一次性删除 sequelize 中已定义 Model 所对应的所有数据表
```



### 数据库安全检查

由于 `sync` 和 `drop` 将永久性的改变数据结构，并可能造成数据的丢失，因此，Sequelize 增加了一个安全检查，以确保你是对正确的数据库进行表的删除、修改操作：

```javascript
sequelize.sync({ force: true, match: /_test$/ })； // 仅当数据库名以 "_test" 结尾时，才执行 sync()
```

- `match` 选项以“正则表达式”作为检查条件。



### 在产品级代码中使用同步

Sequelize 官方**强烈建议**：不要在产品级代码中使用 `sync({ force: true })` 和 `sync({ alter: true })`。如果需要迁移数据库以适应新代码，可以使用 [Sequelize CLI](https://github.com/sequelize/cli) 工具。



## 时间戳（Timestamps）

缺省的状态下，同步 Model（创建数据表）时，Sequelize 会自动添加 `createAt` 和 `updateAt` 两个字段，字段类型为 `DataTypes.DATE`（对应 MySQL 中的 `DATETIME` 类型），用于记录数据行的创建时间和更新时间。

可以通过设置来禁止这个功能，设置方法详见：[Sequelize - Timestamps（英文）](https://sequelize.org/master/manual/model-basics.html#timestamps)。

> **注意：**这个功能是通过 Sequelize 来实现的，而不是通过数据库 SQL triggers 实现的，也就是说，如果绕过 Sequelize 来读写数据表，这两个字段的值将不会被正确填写。



## 字段定义的简写语法

定义 Model 时，如果只需要定义字段类型，那么可以使用简写语法：

```javascript
// 标准定义
const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING
  }
});

// 简写定义
const User = sequelize.define("User", {
  name: DataTypes.STRING
});
```



## 字段定义的选项

定义字段时，除了字段类型外，还有很多选项可以使用：

```javascript
const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = new Sequelize("mysql://root:root@localhost/dbtest");

class Foo extends Model {}
Foo.init(
	{
  	flag: {
      type: DataTypes.BOOLEAN, // 数据类型
      allowNull: false, // 是否允许为 NULL。true：允许；false：不允许。
      defaultValue: true, // 缺省值
      field: "flag_for_foo" // 显式的指定对应的字段名为：flag_for_foo
    },
    identifier: {
      type: DataTypes.INTEGER,
      primaryKey: true, // 指定这个字段为 primary key
      autoIncrement: true // 这是一个自增的字段
    },
    someUnique: {
      type: DataTypes.STRING,
      unique: true // 创建一个 unique constraint（唯一性约束）
    },
    // 创建一个 composite unique key（复合唯一性约束，多字段的是不能完全相同）
    uniqueOne: {
      type: DataTypes.STRING,
      unique: "compositeIndex"
    },
    uniqueTwo: {
      type: DataTypes.INTEGER,
      unique: "compositeIndex"
    },
    // 创建一个 foreign key（外键），与模型 'Bar' 的 'id' 字段关联
    bar_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Bar,
        key: 'id'
      }
    }
	},
	{
  	sequelize,
    modelName: "Foo",
    
    // 既可以在 someUnique 字段定义中使用 unique: true 属性，也可以在 model 选项中，
    // 对 someUnique 字段建立唯一性索引。这两种方式是等效的。
    indexes: [
      {
      	unique: true,
      	fields: ["someUnique"]
    	},
      {
        unique: true,
        fields: ["uniqueOne", "uniqueTwo"]
      }
    ]
  }
);
```



## DataTypes 与数据库数据类型的对应关系

详见官方文档：[Sequelize - Data Types（英文）](https://sequelize.org/master/manual/model-basics.html#data-types)。



## 使用 Model 类派生方法定义 Model 的优点

采用 Model 类派生方法定义 Model 可以很容易的添加自定义实例方法或类的静态方法，从而实现类似于“视图”的功能，有利于代码复用。

```javascript
const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = new SequeLize("mysql://root:root@localhost/dbtest");

class User extends Model {
  getFullname() {
    return [this.firstName, this.lastName].join(' ');
  }
}

User.init(
  {
  	firstName: DataTypes.STRING,
  	lastName: DataTypes.STRING
	},
  {
    sequelize,
    modelName: "User"
  }
);

const user = User.build({
  firstName: "Jane",
  lastName: "Doe"
});

console.log(user.getFullname()); // "Jane Doe"
```

