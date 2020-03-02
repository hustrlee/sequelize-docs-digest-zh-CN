const { Sequelize, Model, DataTypes } = require("sequelize");

const sequelize = new Sequelize("mysql://root:root@127.0.0.1:3306/db", {
  timezone: "+08:00"
});

class User extends Model {}

User.init(
  {
    name: DataTypes.TEXT,
    sex: DataTypes.CHAR,
    favoriteColor: {
      type: DataTypes.TEXT,
      defaultValue: "green"
    },
    age: DataTypes.INTEGER.UNSIGNED,
    cash: DataTypes.DECIMAL(8, 2)
  },
  {
    sequelize,
    modelName: "User"
  }
);

(async () => {
  try {
    await User.sync({ force: true });
    console.log("The table for the User model was just created!");

    const jane = await User.create({ name: "Jane" });
    console.log(jane.toJSON());
    jane.favoriteColor = "red";
    await jane.save();
    console.log(jane.toJSON());

    await sequelize.close();
  } catch (error) {
    console.error(error);
  }
})();
