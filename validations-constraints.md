# 校验和约束

本节学习如何在 model 中使用校验和约束。

本节的例子，使用以下的数据库表配置：

```javascript
const { Sequelize, Op, Model, DataTypes } = require("sequelize");
const sequelize = new Sequelize("mysql://root:root@127.0.0.1/db");

const User = sequelize.define("User", {
  username: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  hashedPassword: {
    type: DataTypes.STRING(64),
    is: /^[0-9a-f]{64}$/i
  }
});

(async () => {
  await sequelize.sync({ force: true });
  // 后续代码
})();
```



## 校验和约束的区别

验证（Validations）是 Sequelize 级别的、纯 Javascript 实现。它能实现非常灵活、非常复杂的数据验证。如果验证失败，Sequelize 不会向数据库发送任何的 SQL 语句。

约束则是 SQL 级别的。最常用的基本约束是唯一性（unique）约束。如果无法通过约束校验，数据库会抛出一个错误，Sequelize 会将这个错误转发给 Javascript。注意：这里有 SQL 语句被执行，验证的处理方式不同。



## 唯一性约束

在上面的示例代码中，我们给 `username` 定义了唯一性约束：

```javascript
/*...*/ {
  username: {
    type: DataTypes.TEXT,
      allowNull: false,
        unique: true
  },
} /*...*/
```

在数据库表中，`username` 字段被创建为 `name TEXT UNIQUE`，如果试图插入一个同名的 username，Sequelize 会抛出 `SequelizeUniqueConstraintError`。



## 允许/不允许 null 值

默认情况下，每个字段都允许 null 值，使用 `allowNull: false` 选项可以禁止 null 值，例如：上面示例代码中的 `username`：

```javascript
/*...*/ {
  username: {
    type: DataTypes.TEXT,
      allowNull: false,
        unique: true
  },
} /*...*/
```



## Sequelize 中 allowNull 的实现

`allowNull` 只在 Sequelize 级别进行校验，它是 *validation* 和 *constraint* 的混合体。

- 校验（check）过程只发生在 Sequelize 级别，当试图对一个不允许 null 的字段赋值 null 时，会产生一个 `ValidationError`，不会执行任何 SQL 语句。
- 同步（sync）到数据库后，该字段在数据库表中也同时添加了 `NOT NULL` SQL 约束。这样，即使是使用 SQL 语句对该字段赋值 null 也会失败。



## 验证器（Validators）

mode 验证器允许开发者对 model 每个属性设定：格式、内容、验证继承。验证将在 `create`、`update` 和 `save` 时自动被触发。也可以调用 `validate()` 手动去验证一个实例。

### 按属性验证

```javascript
sequelize.define('foo', {
  bar: {
    type: DataTypes.STRING,
    validate: {
      is: /^[a-z]+$/i,          // matches this RegExp
      is: ["^[a-z]+$",'i'],     // same as above, but constructing the RegExp from a string
      not: /^[a-z]+$/i,         // does not match this RegExp
      not: ["^[a-z]+$",'i'],    // same as above, but constructing the RegExp from a string
      isEmail: true,            // checks for email format (foo@bar.com)
      isUrl: true,              // checks for url format (http://foo.com)
      isIP: true,               // checks for IPv4 (129.89.23.1) or IPv6 format
      isIPv4: true,             // checks for IPv4 (129.89.23.1)
      isIPv6: true,             // checks for IPv6 format
      isAlpha: true,            // will only allow letters
      isAlphanumeric: true,     // will only allow alphanumeric characters, so "_abc" will fail
      isNumeric: true,          // will only allow numbers
      isInt: true,              // checks for valid integers
      isFloat: true,            // checks for valid floating point numbers
      isDecimal: true,          // checks for any numbers
      isLowercase: true,        // checks for lowercase
      isUppercase: true,        // checks for uppercase
      notNull: true,            // won't allow null
      isNull: true,             // only allows null
      notEmpty: true,           // don't allow empty strings
      equals: 'specific value', // only allow a specific value
      contains: 'foo',          // force specific substrings
      notIn: [['foo', 'bar']],  // check the value is not one of these
      isIn: [['foo', 'bar']],   // check the value is one of these
      notContains: 'bar',       // don't allow specific substrings
      len: [2,10],              // only allow values with length between 2 and 10
      isUUID: 4,                // only allow uuids
      isDate: true,             // only allow date strings
      isAfter: "2011-11-05",    // only allow date strings after a specific date
      isBefore: "2011-11-05",   // only allow date strings before a specific date
      max: 23,                  // only allow values <= 23
      min: 23,                  // only allow values >= 23
      isCreditCard: true,       // check for valid credit card numbers

      // 自定义验证器的例子:
      isEven(value) {
        if (parseInt(value) % 2 !== 0) {
          throw new Error('Only even values are allowed!');
        }
      }
      isGreaterThanOtherField(value) {
        if (parseInt(value) <= parseInt(this.otherField)) {
          throw new Error('Bar must be greater than otherField.');
        }
      }
    }
  }
});
```

**注意！**当验证器需要多个参数时，这些参数必须通过数组进行传递。但是，如果要传递单个数组参数，例如 `isIn` 可接受的字符串数组，则它将被解释为多个字符串参数，而不是一个数组参数。 要解决此问题，请传递一个单长度的参数数组，例如上面的 `[['foo'，'bar']]`。

验证错误信息也可以定制：

```javascript
isIn: {
  args: [['en', 'zh']],
  msg: "Must be English or Chinese"
}
```

### allowNull 与其它验证器的协同

当某个字段被设置为**不允许为 null**，而被赋值为 null 的话，Sequelize 直接会抛出 `ValidationError` 错误，并跳过其它所有的验证器。

另一方面，如果某个字段**允许为 null**，且被赋值为 null 的话，Sequelize 会跳过所有内置的验证器，只允许自定义的验证器。

也就说，比如一个 STRING 字段，可以同时设置成：`allowNull: true` 和 `len: [5, 10]`，两验证规则并不冲突。当值为 null 时，不允许任何验证器；当值不为 null 时，才检查长度是否在 5-10 个之间。

可以通过设置 `notNull` 验证器的错误信息，来自定义 `allowNull` 的错误信息：

```javascript
class User extends Model {}
User.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: "Please enter your name"
      }
    }
  }
}, { sequelize });
```

### model 验证器

model 级别也可以定义验证器。在所有字段验证通过后，执行 model 验证器。model 验证器用于校验字段间的相互关系，这也是很必要的，例如：model 验证器可以保证经度和纬度同时被赋值了。

示例：

```javascript
class Place extends Model {}
Place.init(
	{
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    latitude: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      validate: {
        min: -90,
        max: 90
      }
    },
    longitude: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      validate: {
        min: -180,
        max: 180
      }
    }
  },
  {
    sequelize,
    validate: {
      bothCoordsOrNone() {
        if ((this.latitude === null) !== (this.longitude === null)) {
          throw new Error("Either both latitude and longitude, or neither!");
        }
      }
    }
  }
);

const place = Place.build();
place.latitude = 100; // latitude > 90
// Place 定义时，指定 longitude 的缺省值是 null
try {
  await place.validate();
  console.log("Successlly");
} catch (error) {
  console.log(error.message);
}
// 验证失败，会得到以下输出：
// Validation error: Either both latitude and longitude, or neither!,
// Validation error: Validation max on latitude failed
```

> **注意！！**我无法得到官方文档和官方 API 中所描述的验证失败输出！
>
> **官方文档原文：**
>
> 所有的验证错误，包括字段验证错误和 model 验证错误，都被放在一个验证结果对象中，并以被验证对象的 key 来进行命名。
>
> 尽管 model 验证器的错误信息肯定是单个字符串，但是为了保证和字段验证器错误信息的一致性，Sequelize 仍然将它放在一个数组中，只是这个数组只有一个字符串元素。
>
> ......
>
> ```
> {
> 'latitude': ['Invalid number: latitude'],
> 'bothCoordsOrNone': ['Require either both latitude and longitude or neither']
> }
> ```
>
> 
>
> **[官方 API 参考 - Model - validate()](https://sequelize.org/master/class/lib/model.js~Model.html#instance-method-validate) 原文：**
>
> `validate()` 将返回一个 `Promise`。如果验证成功，则该 Promise 将被兑现；否则，它会发出一个抛出（reject）一个包含 { 字段名称: [错误消息]} 条目的错误实例。
>
> 
>
> **实际输出：**
>
> 实际上，catch 到的 error 是一个包含了 [`ValidationError`](https://sequelize.org/master/class/lib/errors/validation-error.js~ValidationError.html) 类实例的 SequelizeValidationError。其中，`message` 描述了所有的错误信息，每一行对应一个验证错误；`errors` 是 `ValidationError` 类实例 。
>
> 这一点与官方文档、官方 API 参考所描述的不同！

