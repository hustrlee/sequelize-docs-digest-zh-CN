# Getters, Setters & Virtuals

Sequelize 允许开发者自定义 model 属性的 getters 和 setters。

Sequelize 还允许开发者在 model 中定义名为 *virtual attributes* 的虚拟属性。

这些特性对简化代码非常有用。



## Getters

Getter 是自定义 model 中某个字段的 `get()` 函数。

```javascript
const User = sequelize.define("User", {
  // 无论 username 在数据库表中是大写或小写，获取时都转换成大写
  username: {
    type: DataTypes.STRING,
    get() {
      const rawValue = this.getDataValue(username);
      return rawValue ? rawValue.toUpperCase() : null;
    }
  }
});

const user = User.build({ username: "SuperUser123" });
console.log(user.username); // "SUPPERUSER123"
console.log(user.getDataValue(username)); // "SuperUser123"
```

尽管 `username = “SUPERUSER123”`，但是数据库中仍然存的是真实值：`"SuperUser123"`。我们用 `this.getDataValue(username)` 来获取这个值。

**注意！**如果在 `get` 函数中，使用直接使用 `username`，而不是 `getDataValue(username)`，那么 `get` 函数将陷入**死循环**！！请小心使用。



## Setters

Setters 是自定义 model 中某个字段的 `set()` 函数。当对该字段赋值时，自动进行转换。

```javascript
const User = sequelize.define("User", {
  username: DataTypes.STRING,
  password: {
    type: DataTypes.STRING,
    set(value) {
      // 将 password 的 Hash 值存入数据库
      this.setDataValue("password", hash(value));
    }
  }
})；

const user = User.build({ username: "someone", password: "NotSo§tr0ngP4$SW0RD!"})；
console.log(user.password); // '7cfc84b8ea898bb72462e78b4643cfccd77e9f05678ec2ce78754147ba947acc'
console.log(user.getDataValue(password)); // 和 user.password 的值一致
```

从上面的例子，可以看到：在对 `password` 进行赋值时，就完成转换了，无论在数据库表中，还是在内存中，均只能看到 password 的 Hash 值。

在 `set` 函数中，还可以调用其它字段的值参与运算。

```javascript
const User = sequelize.define("User", {
  username: DataTypes.STRING,
  password: {
    type: DataTypes.STRING,
    set(value) {
      // 将 password 的 Hash 值存入数据库
      this.setDataValue("password", hash(this.username + value));
    }
  }
})；
```



## 同时使用 Getters 和 Setters

```javascript
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

const post = await Post.create({ content: "Hello everyone!" });
console.log(post.content); // "Hello everyone!"
console.log(post.getDataValue("content")); // 'H4sIAAAAAAAACvNIzcnJV0gtSy2qzM9LVQQAUuk9jQ8AAAA='
```

- 将内容压缩，并进行 base64 编码后存入数据库。
- 读取数据时，先进行 base64 解码，然后解压缩。

- 现代的数据库通常在数据库引擎中就自动进行了压缩、解压，以减少对磁盘空间的占用。



## 虚拟字段

虚拟字段是 Sequelize 自动填充的字段，并不存在于数据库表中。

在下面的例子里，数据库保存了 `firstName` 和 `lastName`，我们还期望能从 model 中得到 `fullName`。在 [Model 基础 - Model Basics](./model-basics.md) 一节中，我们学习了通过自定义 Model 类方法 `getFullName()` 来获得 `fullName`，实际上，使用 *virtual attributes* 可以更优雅的实现这一功能。

```javascript
const User = sequelize.define("User", {
  firstName: DataTypes.TEXT,
  lastName: DataTypes.TEXT,
  fullName: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.firstName} ${this.lastName}`;
    },
    set(value) {
      // fullName 是一个只读值，如果试图对它赋值，则抛出一个错误；
      // 当然，也可以把 fullName 拆分成 firstName 和 lastName，
      // 分别对它们进行赋值。
      throw new Error("Do not try to set the `fullName` value!");
    }
  }
});

const user = await User.create({ firstName: "John", lastName: "Doe" });
console.log(user.fullName); // "John Doe"
```



## getterMethods 和 setterMethods

Sequelize 还提供了 `getterMethods` 和 `setterMethods` 两个**选项**，来实现和 *virtual attribtues* 相同的功能。

**注意！**官方不鼓励使用这个两个选项，在未来很可能会列入**不推荐使用（deprecated）**的功能。应该直接使用 *virtual attributes*。

