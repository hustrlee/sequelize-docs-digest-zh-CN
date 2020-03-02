const { Sequelize, Model, DataTypes, Op } = require("sequelize");
const sequelize = new Sequelize("mysql://root:root@127.0.0.1/db", {
  timezone: "+08:00"
});

class User extends Model {}
User.init(
  {
    name: DataTypes.TEXT,
    job: DataTypes.TEXT
  },
  { sequelize, modelName: "User" }
);

(async () => {
  await User.sync({ force: true });

  const [user, created] = await User.findOrCreate({
    where: { name: "sdepold" },
    defaults: { job: "Technical Lead Javascript" }
  });
  console.log(user.toJSON());
  console.log(created);

  const { count, rows } = await User.findAndCountAll({
    where: {
      name: {
        [Op.like]: "sd%"
      }
    },
    offset: 0,
    limit: 5
  });
  console.log(count);
  console.log(rows[0].toJSON());

  await sequelize.close();
})();
