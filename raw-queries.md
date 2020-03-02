# 原生 SQL 查询

在很多情况下，执行原始/已准备好的 SQL 查询会更方便，此时可以使用 `sequelize.query` 方法。

默认情况下，该函数将返回两个参数：一个结果数组和一个包含元数据的对象（例如：受影响的行数等）。MySQL 在结果数组中返回元数据，因此，两个返回参数实际上时同一个对象的两个引用。

```javascript
const [results, metadata] = await sequelize.query("UPDATE users SET y = 42 WHERE x = 12");
// results 是空数组，metadata 是更新了多少行
```

在不需要访问元数据的情况下，可以传入查询类型告诉 Sequelize 如何格式化结果。例如，对于简单的 SELECT 查询，可以这么做：

```javascript
const { QueryTypes } = require("sequelize");
const users = await sequelize.query("SELECT * FROM `users`", { type: QueryTypes.SELECT });
// 我们不需要在这里分解结果 - 结果直接返回
```

第二个选项是 model，如果设置 model 选项，则 `sequelize.query` 的返回值是这个 Model 的一组实例。

```javascript
// model 选项接受的值是 Model 的定义。这样很容易把查询结果映射到预定义的 model
const projects = await sequelize.query("SELECT * FROM Projects", {
  model: Project,
  mapToModel: true
});
// projects 中的每一项，都是 Project 的实例。
```



## "Dotted" 属性和 nest 选项

如果表的属性名称包含点，则通过设置 `nest: true` 选项，将结果对象转换成嵌套对象。这是通过 dottle.js 在后台实现的。

- 没有 `nest: true`

```javascript
const { QueryTypes } = require("sequelize");
const records = await sequelize.query("select 1 as `foo.bar.baz`", { type: QueryTypes.SELECT });

// 结果为：
{
  "foo.bar.baz": 1
}
```

- 使用 `nest: true`

```javascript
const { QueryTypes } = require("sequelize");
const records = await sequelize.query("select 1 as `foo.bar.baz`", {
  nest: true,
  type: QueryTypes.SELECT
});

// 结果为：
{
  "foo": {
    "bar": {
      "baz": 1
    }
  }
}
```



## 替换与参数绑定

向 `sequelize.query` 中的 SQL 查询语句传递参数有：替换和参数绑定两种方法；替换又有两种语法格式，只需要掌握一种就足够了：

- 在 SQL 语句中使用以 `:` 开头的命名参数，并通过  `replacements` 选项来指定参数值。

```javascript
const { QueryTypes } = require("sequelize");

await sequelize.query(" SELECT * FROM Projects WHERE status = :status", {
  replacements: { status: "active" },
  type: QueryTypes.SELECT
});
```

