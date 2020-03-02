const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("db", "root", "root", {
  host: "127.0.0.1",
  dialect: "mysql",
  timezone: "+08:00" // 设置 timezone，以保证能正确使用时间函数
});

let testConnect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.close();
  } catch (error) {
    console.error("Unable to connect to the database: " + error);
  }
};

testConnect();
