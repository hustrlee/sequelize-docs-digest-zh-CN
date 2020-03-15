# 关联

Sequelize 支持的标准关联：One-To-One、One-To-Many、和 Many-To-Many。

为了实现标准关联，Sequelize 提供了 4 种关联类型：

- `HasOne`
- `BelongsTo`
- `HasMany`
- `BelongsToMany`

本节解释如何使用这 4 种关联类型，以及如何组合它们来实现 3 种标准关联类型。



## 定义 Sequelize 关联

4 种关联类型的定义是类似的。假设有两个 model `A` 和 `B`。要将它们关联起来：

```javascript
const A = sequelize.define("A", /*...*/);
const B = sequelize.define("B", /*...*/);

A.hasOne(B, { /* options */ }); // A HasOne B
A.belongsTo(B, { /* options */ }); // A BelongsTo B
A.hasMany(B, { /* options */ }); // A HasMany B
A.belongsToMany(B, { throuth: "C", /* options */ }); // A 通过表 C 与 B 形成 BelongsToMany 关联
```

定义关联时，定义的次序很重要。在上面的例子里，`A` 被称为***源模型***，`B` 被称为***目标模型***，这两个术语很重要。

- `A.hasOne(B)` 表明了 `A` 和 `B` 之间存在 One-To-One（一对一）关系，外键在目标模型 `B` 中定义。
- `A.belongsTo(B)` 表明定义了 `A` 和 `B` 之间存在 One-To-One（一对一）关系，外键在源模型 `A` 中定义。
- `A.hasMany(B)` 表明了 `A` 和 `B` 之间存在 One-To-Many（一对多）关系，外键在目标模型 `B` 中定义。

**这三个调用将导致 Sequelize 自动将外键添加到适当的模型中（如果在定义模型时没有定义外键的话）。**

- `A.belongsToMany(B, { through: "C" })` 表明了 `A` 和 `B` 之间存在 Many-To-Many（多对多）关系，使用表 `C` 作为连接表（junction table），连接表 `C` 有两个外键 `aId` 和 `bId`。

**如果连接表 `C` 不存在，Sequelize 将创建连接表，并设置适当的外键。**

> 在上面 *belongsToMany* 的例子中，*through* 选项值为字符串 *’C'*。在这种情况下，Sequelize 自动用这个名字创建一个模型。如果已经定义好了一个模型，也可以直接传递一个模型给 *through* 选项。

以上这些关联类型是基本类型，这些关联类型通常成对使用，以使 Sequelize 更好地定义关联。




## 涉及关联的基本操作

首先讨论“*读（SELECT）*”操作。我们使用以下模型定义来进行讨论：

```javascript
const Ship = sequelize.define("Ship", {
  name: DataTypes.TEXT,
  crewCapacity: DataTypes.INTEGER,
  amountOfSails: DataTypes.INTEGER
});
const Captain = sequelize.define("Captain", {
  name: DataTypes.TEXT,
  skillLevel: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 10 }
  }
});
Captain.hasOne(Ship);
Ship.belongsTo(Captain);
```

很显然，上面的模型是一对一关系：一艘船只有一个船长；一个船长也只有一艘船。

### 关联的读操作 - 饥渴加载（Eager Loading）与延迟加载（Lazy Loading）

理解饥渴加载和延迟加载概念，是理解 Sequelize 关联的读操作逻辑的基础。延迟加载是指：当确实需要时，才获取关联数据的技术；饥渴加载是指：从一开始就读取所有关联数据的技术。

#### 延迟加载

```javascript
const awesomeCaption = await Captian.findOne({ where: { name: "Jack Sparrow" } });
console.log("Name:", awesomeCaptain.name);
console.log("Skill Level:", awesomeCaptain.skillLevel);
// 开始查询船长的船
const hisShip = await awesomeCaptain.getShip();
console.log("Ship Name:", hisShip.name);
console.log("Amount of Sails:", hisShip.amountOfSails);
```

**注意：**`getShip()` 是 Sequelize 自动添加到 `Captain` 的实例方法。Sequelize 还会添加其它的一些实例方法，在本节稍后进行讨论。

在上面的示例中，我们使用了两个查询，仅在需要获取船只信息时，才调用第二个查询。很多时候，这样的方式非常有用，会极大的节省内存和读取数据库的时间。

#### 饥渴加载

```javascript
const awesomeCaption = await Captain.findOne({
  where: {
    name: "Jack Sparrow"
  },
  include: Ship
});
console.log("Name:", awesomeCaption.Name);
console.log("Skill Level:", awesomeCaption.skillLevel);
console.log("Ship Name:", awesomeCaption.ship.name);
console.log("Amount of Sails:", awesomeCaptain.ship.amountOfSails);
```

通过 `include` 选项，只执行了一次数据库查询，就完成了对两张表的查询。 

### 创建、更新和删除

- 直接使用标准模型方法：

```javascript
Bar.create({
  name: "My Bar",
  fooId: 5
});
```

- 或使用可用于关联模型的***特殊方法或mixin***，在本节稍后进行讨论。

**注意：**在关联的情况下，不应使用 `save()` 实例方法。因为，在饥渴加载中，对父对象进行 `save()`，作为查询结果的子对象将完全不了解这些改变。




## 关联的别名、自定义外键

在上面的示例中，Sequelize 自动定义外键的名字，例如：在船长和船的例子中，Sequelize 自动在 Ship 的模型中定义了外键 `captainId`。当然，我们也可以很容易的自定义外键。

考虑以下简化的“船长”和“船”的模型：

```javascript
const Ship = sequelize.define("ship", { name: DataTypes.TEXT });
const Captain = sequelize.define("Captain", { name: DataTypes.TEXT });
```

有三种方法可以为外键指定不同的名称：

- 直接指定外键的名称。
- 定义别名。
- 同时做以上两个动作。

### 到目前为止的小结：默认设置

```javascript
Ship.belongsTo(Captain);  // Sequelize 自动在 Ship 中创建名为 `captainId` 的外键
// 有两种查询方法
// 饥渴加载
console.log((await Ship.findAll({ include: Captain })).toJSON());
console.log((await Ship.findAll({ include: "Captain" })).toJSON());
// 延迟加载
const ship = Ship.findOne();
console.log((await ship.getCaptain()).toJSON());
```

### 直接指定外键名称

```javascript
Ship.belongsTo(Captain, { foreignKey: "bossId" }); // 在 Ship 中创建名为 `bossId` 的外键
```

### 定义别名

```javascript
Ship.belongsTo(Captain, { as: "leader" }); // 在 Ship 中创建名为 `leaderId` 的外键
console.log((await Ship.findAll({ include: "leader" })).toJSON());
console.log((await Ship.findAll({
  include: {
    model: Captain,
    as: "leader"
  }
})).toJSON());

const ship = Ship.findOne();
console.log((await ship.getLeader()).toJSON());
```

### 同时做以上两个动作

```javascript
Ship.belongsTo(Captain, { as: "leader", foreignKey: "boosId" }); // 外键名为 `bossId`
console.log((await Ship.findAll({ include: "leader" })).toJSON());
console.log((await Ship.findAll({
  include: {
    model: Captain,
    as: "leader"
  }
})).toJSON());

const ship = Ship.findOne();
console.log((await ship.getLeader()).toJSON());
```



## 添加到实例的特殊“方法/mixins”

当两个模型之间定义了关联，那么这些模型的实例将获得一些特殊的方法来与相关联的另一方进行交互。

假设有两个模型：`Foo` 和 `Bar`，它们之间设置了关联，不同的关联会向它们的实例添加不同的“方法和mixins”。

### Foo.hasOne(Bar)

- `fooInstance.getBar()`
- `fooInstance.setBar()`
- `fooInstance.createBar()`

```javascript
const foo = await Foo.create({ name: "the-foo" });
const bar1 = await Bar.create({ name: "some-bar" });
const bar2 = await Bar.create({ name: "another-bar" });
// Stage 1：初始状态
console.log(await foo.getBar()); // null, foo 没有和任何 Bar 实例关联起来
// Stage 2：把 foo 和 bar1 关联起来
await foo.setBar(bar1);
console.log((await foo.getBar()).name); // "some-bar"
// Stage 2（另一种方式）：或者创建另一个 Bar 实例，并与 foo 进行关联
await foo.createBar({ name: "yet-another-bar" }); 
const newlyAssociatedBar = await foo.getBar(); // 获取与 foo 相关联的 Bar 实例
console.log(newlyAssociatedBar.name); // "yet-another-bar"
// Stage 3：取消关联
await foo.setBar(null); // 取消关联
console.log(await foo.getBar()); // null
```

> **注意！**如果要得到和注释中的输出相同的结果， `Stage 2` 要不选择和已创建好的 Bar 实例相关联，要不选择创建一个新的 Bar 实例并与之关联，而不能做两次关联。这里具体分析一下：
>
> - `Foo.hasOne(Bar)` 定义了从 `Foo` 到 `Bar` 的一对一关联，即：`Bar` 只能和一个 `Foo` 关联（或没有）；但是 `Foo` 可能和多个 `Bar` 关联。
> - 如果做两次关联操作（先和 `bar1` 关联，然后新建一个 `Bar` 并与之关联），那么就会有两个 `Bar` 模型实例与 `foo` 关联。
> - `foo.getBar()` 只能返回第一个和 `foo` 关联的模型实例。因此，在做了两次关联后，`newlyAssociatedBar` 将等于 `bar1`，此时 `newlyAssociatedBar.name` 等于 `"some-bar"`。
> - 接下来的取消关联操作也有问题，因为只取消了 `bar1` 的关联，而不会取消第二个关联。因此，`getBar()` 将返回第二个关联实例，而不会是 null。

### Foo.belongsTo(Bar)

- `fooInstance.getBar()`
- `fooInstance.setBar()`
- `fooInstance.createBar()`

> **注意！**看上去 `belongsTo` 和 `hasOne` 关联所添加的方法是一样的，但是要注意到：
>
> - `hasOne` 是从不包含外键的表中进行操作
> - `belongsTo` 是从包含外键的表中进行操作

### Foo.hasMany(Bar)

- `fooInstance.getBars()`
- `fooInstance.countBars()`
- `fooInstance.hasBar()`
- `fooInstance.hasBars()`
- `fooInstance.setBars()`
- `fooInstance.addBar()`
- `fooInstance.addBars()`
- `fooInstance.removeBar()`
- `fooInstance.removeBars()`
- `fooInstance.createBars()`

```javascript
const foo = await Foo.create({ name: "the-foo" });
const bar1 = await Bar.create({ name: "some-bar" });
const bar2 = await Bar.create({ name: "another-bar" });
console.log(await foo.getBars()); // []，没有关联
console.log(await foo.countBars()); // 0
console.log(await foo.hasBar(bar1)); // false，bar1 不在关联列表中
await foo.addBars([bar1, bar2]); // 把 bar1、bar2 添加到关联
console.log(await foo.countBars()); // 2
await foo.addBar(bar1); // 关联 bar1，其实没有效果，前面已经关联过了
console.log(await foo.countBars()); // 2
console.log(await foo.hasBar(bar1)); // true
await foo.removeBar(bar2); // 把 bar2 从关联中移除
console.log(await foo.countBars()); // 1
await foo.createBar({ name: "yet-another-bar" });
console.log(await foo.countBars()); // 2
await foo.setBars([]); // 取消所有的关联
console.log(await foo.countBars()); // 0
```

getter 方法可以接受查询方法（例如：`findAll`）的选项：

```javascript
const easyTasks = await project.getTasks({
  where: {
    difficulty: {
      [Op.lte]: 5
    }
  }
});
const taskTitles = (await project.getTasks({
  attributes: ["title"],
  raw: true
})).map(task => task.title);
```

### Foo.belongsToMany(Bar, { through: Baz })

和 `Foo.hasMany(Bar)` 相同。



## 创建标准关系

如前所述，Sequelize 关联常成对使用来创建关系（relationship）。

- 创建**一对一**关系，将 `hasOne` 和 `belongTo` 一起使用；
- 创建**一对多**关系，将 `hasMany` 和 `belongTo` 一起使用；
- 创建**多对多**关系，将两个 `belongsToMany` 一起使用。

> 注意：还有一个*超级多对多关系*，一次使用 6 个关联，将在"[高级多对多关系指南]()"中进行讨论。



## 一对一关系

### 原理

假设我们有两个模型，`Foo` 和 `Bar`。我们要在 `Foo` 和 `Bar` 之间建立一对一关系。我们知道在关系数据库中，这将通过在其中一个表中建立外键来完成。但是，疑问是：外键应该建立在哪个表中？换句话说，是应该在 `Foo` 中有一个 `barId` 字段，还是应该在 `Bar` 中有一个 `fooId` 字段？

原则上，这两个选项都可以在 `Foo` 和 `Bar` 之间建立一对一关系。但是，当我们说：“`Foo` 和 `Bar` 之间存在一对一关系”时，尚不清楚该关系是强制性的，还是可选性的。换句话说，`Foo` 是否可以没有 `Bar` 而存在？没有 `Foo` 的 `Bar` 可以存在吗？这些问题的答案有助于帮助我们弄清楚外键应该在哪个表中。

例如：A：教师表；B：班级表；一个班只有一个班主任老师；同时，一个老师也只能任职某个班的班主任；一个班可以没有班主任老师。

### 目标

假设有两个模型，`Foo` 和 `Bar`。要求在它们之间建立一对一关系，在 `Bar` 中建立字段 `fooId`。

### 实现

```javascript
Foo.hasOne(Bar);
Bar.belongsTo(Foo);
```

由于未设置任何选项，因此 Sequelize 将从模型名称中自行推断。在这种情况下，Sequelize 知道必须在 `Bar` 中添加 `fooId` 字段。随后调用 `Bar.sync()` 时，将在生成外键，并关联到 `foos.id`。

### 选项

#### onDelete 和 onUpdate

可以设置 `ON DELETE` 和 `ON UPDATE` 的行为：

```javascript
Foo.hasOne(Bar, {
  onDelete: "RESTRICT",
  onUpdate: "RESTRICT"
});
Bar.belongsTo(Foo);
```

可能的取值包括：`RESTRICT`、`CASCADE`、`NO ACTION`、`SET DEFAULT` 和 `SET NULL`。

One-To-One 关联的缺省值是：`ON DELETE SET NULL` 和 `ON UPDATE CASCADE`。

#### 自定义外键

默认情况下，创建的外键名称为 `fooId`。也可以自定义外键的名称，例如：`myFooId`。

```javascript
// 第一种方式
Foo.hasOne(Bar, { foreignKey: "myFooId" });
Bar.belongsTo(Foo);

// 第二种方式
Foo.hasOne(Bar, {
  foreignKey: {
    name: "myFooId"
  }
});
Bar.belongsTo(Foo);

// 第三种方式
Foo.hasOne(Bar);
Bar.belongsTo(Foo, { foreignKey: "myFooId" });

// 第四种方式
Foo.hasOne(Bar);
Bar.belongsTo(Foo, {
  foreign: {
    name: "myFooId"
  }
});
```

`foreignKey` 实际上也是一个字段，因此字段的定义选项都可以使用，比如：`type`、`allowNull`、`defaultValue` 等。

```javascript
const { DataTypes } = require("sequelize");

Foo.hasOne(Bar, {
  foreignKey: {
    // name: "myFooId",
    type: DataTypes.UUID
  }
});
Bar.belongsTo(Foo);
```

#### 强制关联与可选关联

默认情况下，关联被视为是可选的。也就是说，在我们的例子里，`fooId` 是允许为 null 的，也就是某行 Bar 数据并没有和 Foo 中任意一行相关。指定 `allowNull: false` 选项，则这种关联就是强制性的。

```javascript
Foo.hasOne(Bar, {
  foreignKey: {
    allowNull: false
  }
});
// "fooId" INTEGER NOT NULL REFERENCES "foos" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT
```



## 一对多关系

### 原理

一对一关联把一个源数据行和多个目标数据行连接在一起，而目标数据行只和一个源数据行相关联。

这意味着，一对多关联种，源模型和目的模型不能互换，只能在目的模型中设置外键。

例如：A：班级表；B：学生表；一个学生只属于一个班；同时，一个班有多个学生。

### 目标

在此示例中，考虑模型 `Team` 和 `Player`。它们存在一对多的关系，即：一个 `Team` 可以有多个 `Player`，而每个 `Player` 只能属于某一个 `Team`。

### 实现

```javascript
Team.hasMany(Player);
Player.belongsTo(Team);
```

### 选项

可用的选项与"一对一"的选项完全相同。



## 多对多关系

### 原理

多对多关系不能像其它关系那样通过一个表添加外键这种简单方式来表达这一关系，取而代之是使用“连接模型”的概念。连接模型是 Sequelize 中额外的模型，在数据库中也将添加额外的表，连接模型具有两个外键字段，分别与源模型、目标模型进行关联。*junction table* 也称为 *join table* 和 *through table*。

例如：A：教师表；B：班级表；一个班有多个老师；一个老师也教多个班。它们通过 C：“课表” 关联在一起。

### 目标

在此示例中，考虑模型 `Movie` 和 `Actor`。一位演员可能参与了多部电影，而一部电影中也有许多演员参与。连接表为 `ActorMovies`，也就是电影的演员表，它包含外键 `movieId` 和 `actorId`。

### 实现

```javascript
const Movie = sequelize.define("Movie", { name: DataTypes.STRING });
const Actor = sequelize.define("Actor", { name: DataTypes.STRING });
Movie.belongsToMany(Actor, { through: "ActorMovies" });
Actor.belongsToMany(Movie, { through: "ActorMovies" });
```

给 `through` 选项传递一个字符串 `'ActorMovies'`，Sequelize 会创建一个模型 `ActorMovies`。也可以手动创建模型，然后将模型传递给 `through` 选项。

```javascript
const Movie = sequelize.define("Movie", { name: DataTypes.STRING });
const Actor = sequelize.define("Actor", { name: DataTypes.STRING });
const ActorMovies = sequelize.define("ActorMovies", {
  MovieId: {
    type: DataTypes.INTEGER,
    references: {
      model: Movie, // 也可以是字符串 'Movie'
      key: 'id'
    }
  },
  ActorId: {
    type: DataTypes.INTEGER,
    references: {
      model: Actor, // 也可以是字符串 'Actor'
      key: 'id'
    }
  }
});
Movie.belongsToMany(Actor, { through: "ActorMovies" });
Actor.belongsToMany(Movie, { through: "ActorMovies" });
```

### 选项

与“一对一”、“一对多”关系不同，“多对多”关系中 `ON UPDATE` 和 `ON DELETE` 的默认设置都是 `CASCADE`。




## 为什么要成对使用关联？

如果不成对使用关联，那么只有源模型知道发生了关联。例如：在使用 `Foo.hasOne(Bar)` 时（此时 `Foo` 是源模型、`Bar` 是目标模型），只有 `Foo` 知道关联的存在，而 `Bar` 并不知道。导致 `Bar` 的实例中不会自动添加 `getFoo()`、`setFoo()`、`createFoo()` 等方法。同样，在执行饥渴加载查询时，`Bar` 也无法调用 `Bar.findOne({ include : Foo })` 这样的查询方法。

为了充分利用 Sequelize 的所有能力，我们通常成对的设置关系，以便两个模型都能使用这些方法。



## 涉及相同模型的多个关联

在 Sequelize 中，只需要使用别名，就可以在两个模型之间定义多个关联：

```javascript
Team.hasOne(Game, { as: "HoemTeam", foreignKey: "homeTeamId" });
Team.hasOne(Game, { as: "AwayTeam", foreignKey: "awayTeamId" });
Game.belongsTo(Team);
```



## 创建引用不是主键的字段的关联

Sequelize 允许定义关联到非主键字段的关联，但是这个字段必须具备唯一性约束。

......