const { Sequelize, Model, DataTypes, Op } = require("sequelize");
const sequelize = new Sequelize("mysql://root:root@127.0.0.1/db", {
  timezone: "+08:00"
});

// 声明 Foo 数据表的模型
class Foo extends Model {}
class Project extends Model {}
Foo.init(
  {
    rand: DataTypes.INTEGER,
    title: DataTypes.TEXT,
    description: DataTypes.TEXT
  },
  {
    sequelize,
    modelName: "Foo",
    tableName: "Foo"
  }
);
Project.init(
  {
    name: DataTypes.TEXT,
    description: DataTypes.TEXT
  },
  {
    sequelize,
    modelName: "Project",
    tableName: "Project"
  }
);

// 建表，并插入几行数据
(async () => {
  await Foo.sync({ force: true });
  await Foo.bulkCreate([
    {
      rand: 1100,
      title: "Boat-abc",
      description: "abc-boat-123"
    },
    {
      rand: 900,
      title: "Boat-abc",
      description: "abc-boat-123"
    },
    {
      title: "abc-Boat-123",
      description: "abc-boat-123"
    },
    {
      title: "Boat-abc"
    }
  ]);

  await Project.sync({ force: true });
  await Project.bulkCreate([
    {
      name: "Project A",
      description: "Hello World."
    },
    {
      name: "Some Project",
      description: "Hello World."
    },
    {
      name: "Some Project",
      description: "World Hello."
    },
    {
      name: "Some Project",
      description: "Hello World."
    },
    {
      name: "Some Project",
      description: "这个是应该被选中的。"
    }
  ]);

  // 等待 1s，因为客户端时间和服务器时间并不完全同步
  await (() => {
    return new Promise(resolve => setTimeout(resolve, 1000));
  })();

  // 搜索 1
  const foos = await Foo.findAll({
    where: {
      rand: {
        [Op.or]: {
          [Op.lt]: 1000,
          [Op.eq]: null
        }
      },
      createdAt: {
        [Op.and]: {
          [Op.lt]: new Date(),
          [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000) // 一天前
        }
      },
      [Op.or]: {
        title: {
          [Op.like]: "Boat%"
        },
        description: {
          [Op.like]: "%boat%"
        }
      }
    }
  });
  console.log(JSON.stringify(foos, null, 2));

  //搜索2
  const projects = await Project.findAll({
    where: {
      name: "Some Project",
      [Op.not]: {
        [Op.or]: {
          id: [1, 2, 3],
          description: {
            [Op.like]: "Hello%"
          }
        }
      }
    }
  });
  console.log(JSON.stringify(projects, null, 2));

  // 关闭连接
  await sequelize.close();
})();
