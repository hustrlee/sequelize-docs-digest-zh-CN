const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = new Sequelize("mysql://root:root@127.0.0.1/db", {
  timezone: "+08:00"
});

class User extends Model {}
User.init(
  {
    name: DataTypes.TEXT,
    favoriteColor: {
      type: DataTypes.TEXT,
      defaultValue: "green"
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
  const jane = await User.create({
    name: "Jane",
    age: 100,
    cash: 5000
  });
  await jane.increment({
    age: 2,
    cash: 100
  });
  await sequelize.close();
})();
