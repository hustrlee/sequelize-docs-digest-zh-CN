const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = new Sequelize("mysql://root:root@127.0.0.1/db");

class Foo extends Model {}

Foo.init(
  {
    flag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "flag_for_foo"
    },
    identifier: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    someUnique: {
      type: DataTypes.STRING,
      unique: true
    },
    uniqueOne: DataTypes.STRING,
    uniqueTwo: DataTypes.INTEGER
  },
  {
    sequelize,
    modelName: "Foo",

    indexes: [
      {
        unique: true,
        fields: ["uniqueOne", "uniqueTwo"]
      }
    ]
  }
);

(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log("Create table 'Foos' successfully.");
    await sequelize.close();
  } catch (error) {
    console.error("Create table 'Foos' failed: ", error);
  }
})();
