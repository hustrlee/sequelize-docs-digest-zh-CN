const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = new Sequelize("mysql://root:root@127.0.0.1/db", {
  timezone: "+08:00"
});

class User extends Model {}
User.init(
  {
    firstName: DataTypes.TEXT,
    lastName: DataTypes.TEXT
  },
  {
    sequelize
  }
);

(async () => {
  // 创建 Users 表
  await sequelize.sync({ force: true });

  // 插入两行数据
  await User.bulkCreate([
    { firstName: "Richard", lastName: "Public" },
    { firstName: "Jane", lastName: "Doe" }
  ]);

  // 查找并显示所有数据
  let users = await User.findAll();
  console.log("All users: ", JSON.stringify(users, null, 2));

  // 将 Jane 的 lastName 更新为 "Doe II"
  await User.update({ lastName: "Doe II" }, { where: { firstName: "Jane" } });

  // 查找并显示所有数据
  users = await User.findAll();
  console.log("All users: ", JSON.stringify(users, null, 2));

  // 查找并重命名数据
  users = await User.findAll({
    attributes: ["firstName", ["lastName", "familyName"]]
  });
  console.log(JSON.stringify(users, null, 2));

  // 使用聚合函数
  users = await User.findAll({
    attributes: [
      [sequelize.fn("GROUP_CONCAT", sequelize.col("firstName")), "concat"],
      [sequelize.fn("COUNT", sequelize.col("id")), "total_user"]
    ]
  });
  console.log(JSON.stringify(users, null, 2));

  // 使用排除选项
  users = await User.findAll({
    attributes: {
      exclude: ["createdAt", "updatedAt"]
    }
  });
  console.log(JSON.stringify(users, null, 2));

  // 删除所有数据
  // await User.destroy({ truncate: true });

  // 关闭数据库连接
  await sequelize.close();
})();
