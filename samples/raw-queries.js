const { Sequelize, Model, DataTypes, QueryTypes } = require("sequelize");
const sequelize = new Sequelize("mysql://root:root@127.0.0.1/db", {
  timezone: "+08:00"
});

const Project = sequelize.define("Project", {
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "active",
    validate: {
      isIn: [["active", "inactive"]]
    }
  }
});

(async () => {
  await Project.sync({ force: true });
  for (let i = 1; i < 10; i++) {
    const project = Project.build();
    project.name = Math.random() < 0.5 ? `Project-${i}` : `Ben-${i}`;
    project.description = `项目 ${i}`;
    project.status = Math.random() < 0.5 ? "active" : "inactive";

    await project.save();
  }

  // 标准形式
  const [results, metadata] = await sequelize.query(
    "UPDATE `Projects` SET `description` = CONCAT(`description`, ' - inactive') WHERE `status` = 'inactive'"
  );
  console.log(results); // MySQL 中，results = metadata
  console.log(metadata);

  // 指定查询类型，并传递查询参数
  const projects = await sequelize.query(
    "SELECT * FROM Projects WHERE status = :status",
    {
      replacements: { status: "active" },
      type: QueryTypes.SELECT
    }
  );
  console.log(projects);

  // 把查询结果装入 model
  const projectsInstance = await sequelize.query(
    "SELECT * FROM Projects WHERE status = :status AND name LIKE :nameTemplate",
    {
      model: Project,
      mapToModel: true,
      replacements: { status: "inactive", nameTemplate: "Ben%" },
      type: QueryTypes.SELECT
    }
  );
  for (let index in projectsInstance) {
    console.log(projectsInstance[index].toJSON());
  }

  await sequelize.close();
})();
