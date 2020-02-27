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

```javascript
const { Sequelize } = require("sequelize");

```

