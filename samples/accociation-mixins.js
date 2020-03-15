const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("mysql://root:root@127.0.0.1/db", {
  timezone: "+08:00"
});

const Foo = sequelize.define("Foo", { name: DataTypes.TEXT });
const Bar = sequelize.define("Bar", { name: DataTypes.TEXT });

// Foo.hasOne(Bar);
Foo.belongsTo(Bar);

(async () => {
  // 删空数据表，由于定义了关联，外键的存在导致删表是有顺序的，要根据情况调整删除顺序
  await Foo.drop();
  await Bar.drop();
  // 建表
  await sequelize.sync();

  const foo = await Foo.create({ name: "the-foo" });
  const bar1 = await Bar.create({ name: "some-bar" });
  const bar2 = await Bar.create({ name: "another-bar" });
  // Stage 1：初始状态
  console.log(await foo.getBar()); // null, foo 没有和任何 Bar 实例关联起来
  // Stage 2：把 foo 和 bar1 关联起来
  await foo.setBar(bar1);
  console.log((await foo.getBar()).name); // "some-bar"
  // Stage 2（另一种方式）：或者创建另一个 Bar 实例，并与 foo 进行关联
  // await foo.createBar({ name: "yet-another-bar" });
  // const newlyAssociatedBar = await foo.getBar(); // 获取与 foo 相关联的 Bar 实例
  // console.log(newlyAssociatedBar.name); // "yet-another-bar"
  // Stage 3：取消关联
  // await foo.setBar(null); // 取消关联
  // console.log(await foo.getBar()); // null

  await sequelize.close();
})();
