# 入门（Getting Started）

本节内容指导你对 Sequelize 进行简单设置。



## 安装 Sequelize MySQL 开发环境

```bash
npm install --save sequlize
npm install --save mysql2			# mysql 驱动程序
```

> 在 Sequlize V6 没有正式发布前，上述命令安装的仍然是 Sequelize V5。如果想尝试 V6 Beta，应使用以下安装命令：
>
> ```bash
> npm install sequelize@next
> ```



## 连接到数据库

连接到 MySQL 有两种方法：

```javascript
const { Sequelize } = require("sequelize");

// 第一种连接方式：使用数据库连接 URI
const sequelize = new Sequelize("mysql://user:pass@example.com:3306/dbname", {
  timezone: "+08:00" // 设置 timezone，以保证能正确使用时间函数
});

// 第二种连接方式：分别传递连接参数
const sequelize = new Sequelize('dbname', 'user', 'pass', {
  host: "example.com",
  dialect: "mysql",
  timezone: "+08:00"
});
```



## 测试连接

```javascript
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("mysql://user:pass@example.com:3306/dbname");

let testConnect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database: ", error);
  }
}

testConnect();
```



## 关闭连接

Sequelize 会保持数据库连接，以提高性能，缺省保持 10s。可以使用 `sequelize.close()` 来关闭连接。例如：以上 `try{}` 代码段，可以改写成：

```javascript
try {
  await sequelize.authenticate();
  console.log("Connection has been established successfully.");
  await sequelize.close();
  console.log("Connection has been closed successfully.");
} catch (error) {...}
```



