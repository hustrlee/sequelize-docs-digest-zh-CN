# 饥渴加载

饥渴加载是一次查询几个模型（一个“主模型”和一个或多个关联模型）的数据行为。在 SQL 级别上，这是具有一个或多个 join 的查询。

完成此操作后，Sequelize 将关联的模型加入到返回对象中。

在 Sequelize 中，饥渴加载是通过 `include` 选项指定的。



## 基础的例子

假设使用以下的数据模型定义：

```javascript
const User = sequelize.define("User", { name: DataTypes.STRING });
const Task = sequelize.define("Task", { name: DataTypes.STRING });
const Tool = sequelize.define("Tool", {
  name: DataTypes.STRING,
  size: DataTypes.STRING
});
User.hasMany(Task);
Task.belongsTo(User);
User.hasMany(Tool, { as: "Instruments" });
```

