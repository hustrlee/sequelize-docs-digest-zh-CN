# Model 实例

我们已经知道了，Model 是一个 ES6 类类型，可以被实例化，其实例就是数据表的一行数据（row）。

在本节的例子中，使用如下 Sequelize 配置：

```javascript
const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = new Sequelize("mysql://root:root@localhost/dbtest");

class User extends Model {}
User.init(
  {
    name: DataTypes.TEXT,
    favoriteColor: {
      type: DataTypes.TEXT,
      defaultValue: "greed"
    },
    age: DataTypes.INTEGER,
    cash: DataTypes.INTEGER
  },
  {
    sequelize
  }
);

(async () => {
  await sequelize.sync({ force: true });
  // 接下来的示例代码加在这里
  
  // 关闭数据库连接
  await sequelize.close();
})();
```



## 创建实例

> **重要！**尽管 model 是一个类，但是不能使用 `new` 来创建实例，而需要使用 `build` 方法。

```javascript
const jane = User.build({ name: "Jane" });
console.log(jane.instanceof User); // true
console.log(jane.name); // "Jane"
```

`build` 方法只是在内存中创建了一个映射到数据表的实例，并没有写到数据库中，需要使用 `save` 方法回写数据库。

```javascript
await jane.save();
console.log("Jane was saved to the database!");
```

> 除了 `build` 等少数几个不涉及数据库操作的方法，Sequelize 中的绝大多数方法都是异步的（asynchronous）。可以用 `await` 来等待其调用完成。



### 一个非常有用的简写：create 方法

`create`  = `build` + `save`

```javascript
const jane = await User.create({ name: "Jane" });
console.log(jane.toJSON()); // { favoriateColor: 'green', id: 1, name: 'Jane', ...}
```



## 更新实例

更新实例后，应调用 `save` 方法回写数据库。

```javascript
const jane = await User.create({ name: "Jane" });
jane.name = "Ada"; // 此时，数据库表中的 name = "Jane"
await jane.save(); // 更新数据库
// save 完成后，数据库表中的 name = "Ada"
```



## 重新载入实例

在执行 `save` 回写数据库前，可以使用 `reload` 方法，从数据库表中恢复这一行数据。

```javascript
const jane = User.create({ name: "Jane" });
jane.name = "Ada";
console.log(jane.name); // "Ada"，但是数据库表中仍然是 "Jane"
await jane.reload(); // 从数据库表中重新载入
console.log(jane.name); // "Jane"
```



## 只保存某些字段

`save` 方法可以指定保存的字段名。

```javascript
const jane = await User.create({ name: "Jane" });
console.log(jane.name); // "Jane"
console.log(jane.favoriteColor); // "green"，缺省值
jane.name = "Jane II";
jane.favoriteColor = "blue";
await jane.save({ fields: ["name"] }); // 只向数据库回写 name 字段
console.log(jane.name); // "Jane II"，内存中 name = "Janem II"
console.log(jane.favriteColor); // "blue", 内存中 favriteColor = "blue"
await jane.reload(); // 读取数据库表中的数据
console.log(jane.name); // "Jane II"，数据库表中 name 更新成功
console.log(jane.favoriteColor); // "green"，数据库表中 favoriteColor 没有更新
```



## save 方法的执行逻辑

`save` 方法只会保存那些变更过的字段。也就是说：

- 如果什么都没有改变，`save` 方法完全不会回写数据库；
- 如果只改变了部分字段，`save` 方法会调用 SQL 语句 `UPDATE` 来更新改变的字段。

这样，可以优化数据库的读写性能。



## 增加/减少整数值

在并行的情况下 - 例如：多个异步回调中对数据库进行读写 - 可能会发生冲突而导致错误，Sequelize 的解决方案是使用 `increment/decrement` 方法。

```javascript
const jane = await User.create({ name: "Jane", age: 100, cash: 5000 });
await jane.increment({
  age: 2, // age = age + 2
  cash: 100 // cash = cash + 100
}); // 完成后，model 和 数据库表均已被更新

// increment/decrement 还可以用以下的语法形式
await jane.increment("age"); // age = age + 1
await jane.increment("age", { by: 2 }); // age = age + 2
await jane.increment(["age", "cash"], { by: 2 }); // age = age + 2, cash = cash + 2
```

>  `increment/decrement` 方法的实质是：调用 SQL 语句 `UPDATE 'Users' SET 'age' = 'age' + 2, 'cash' = 'cash' + 100, WHERE 'id' = 1`，利用数据库的能力来解决并行冲突。



## 删除实例

> **重要！**删除实例，也会相应的从数据库表中删除行。

```javascript
const jane = await User.create({ name: "Jane" });
await jane.destroy();
// 刚才创建的数据行，从数据库中删除了
```



