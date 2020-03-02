const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize("mysql://root:root@127.0.0.1/db", {
  timezone: "+08:00"
});

const User = sequelize.define("User", {
  firstName: DataTypes.TEXT,
  lastName: DataTypes.TEXT,
  fullName: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.firstName} ${this.lastName}`;
    },
    set(value) {
      const name = value.split(" ");
      const firstName = name[0];
      const lastName = name.slice(1).join(" ");
      this.setDataValue("firstName", firstName);
      this.setDataValue("lastName", lastName);
    }
  }
});

(async () => {
  await User.sync({ force: true });
  const users = await User.bulkCreate([
    { fullName: "John Doe" },
    { firstName: "Richard", lastName: "Public" }
  ]);

  console.log("User1: ", users[0].toJSON());
  console.log("User2: ", users[1].toJSON());

  await sequelize.close();
})();
