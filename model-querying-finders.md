# 其它查询方法

Sequelize 中的查询方法将生成 `SELECT` SQL 语句。

### 使用 { raw: true } 选项

默认情况下，查询的结果是一组 model 类的实例（而不仅仅是纯 Javascript 对象）。也就是说，Sequelize 把数据库的返回结果，封装到合适的类实例对象中。少数情况下，数据库返回了大量的查询结果，封装类实例就比较低效了。在查询方法中，使用 `{ raw: true }` 选项，可以禁用封装，而直接返回纯查询结果。

### findAll

在上一节已经学习了 `findAll` 方法。它生成标准的 `SELECT` 查询语句，并返回数据库表中符合 `where` 条件的项。

### findByPk

`findByPk` 方法通过主键（Primary Key）返回数据库表中的一行数据。

```javascript
const project = await Project.findByPk(123);
if (project === null) {
  console.log("Not found!");
} else {
  console.log("Found item with primay key equal to 123.");
};
```

### findOne

`findOne` 方法返回符合 `where` 查询条件的第一行数据。

```javascript
const project = await Project.findOne({ where: { title: "My Title" } });
```

### findOrCreate

`findOrCreate` 方法顾名思义：在找到符合 `where` 查询条件的行时，就返回查询结果；如果没有找到，则插入一行数据。新行的字段、值使用 `defaults` 选项来进行填充；`defaults` 中没有指定的字段、值，会用 `where` 中指定的字段、值来进行填充。

下面这段代码将向数据库的 `Users` 表插入一行值为：`{ name: "sdepold", job: "Technical Lead Javascript" }` 的数据。

```javascript
const [user, created] = await User.findOrCreate(
  { where: { name = "sdepold" } },
  {
    defaults: {
      job: "Technical Lead Javascript"
    }
  }
);
```

`findOrCreate` 方法返回两个值：第一个值是查询结果、或插入的结果；第二个值是是否插入了数据。

### findAndCountAll

`findAndCountAll` 方法合并了 `findAll` 方法和 `count` 方法。它返回一个包括两个属性的对象：

- `count`：整数，返回的记录条数。
- `rows`：对象数组，返回查询结果。

这个函数在分页查询中特别有用。

```javascript
const { count, rows } = await Project.findAndCountAll({
  where: {
    title: {
      [Op.like]: "foo%"
    }
  },
  offset: 10,
  limit: 2
});
```

