const { Sequelize, DataTypes } = require("sequelize");
const { gzipSync, gunzipSync } = require("zlib");

const sequelize = new Sequelize("mysql://root:root@127.0.0.1/db", {
  timezone: "+08:00"
});

const Post = sequelize.define("Post", {
  content: {
    type: DataTypes.TEXT,
    get() {
      const storedValue = this.getDataValue("content");
      const gzippedBuffer = Buffer.from(storedValue, "base64");
      const unzippedBuffer = gunzipSync(gzippedBuffer);
      return unzippedBuffer.toString();
    },
    set(value) {
      const gzipbuffer = gzipSync(value);
      this.setDataValue("content", gzipbuffer.toString("base64"));
    }
  }
});

(async () => {
  await Post.sync({ force: true });

  const post = await Post.create({ content: "Hello everyone!" });
  console.log(post.content);
  console.log(post.getDataValue("content"));

  await sequelize.close();
})();
