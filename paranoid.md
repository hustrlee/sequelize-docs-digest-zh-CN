# Paranoid

Sequelize 支持 *paranoid table* 的概念。*paranoid table* 在删除记录时，并不会真正的删除它，而是增加一个特殊字段 `deletedAt` 来标示该行在什么时候被“删除”了。

也就是说，*paranoid table* 执行*软删除*，而没有执行*硬删除*。



## 定义一个 *paranoid* 模型

```javascript
class Post extends Model {}
Post.init(
  { /* 在这里定义字段 */ },
  {
    sequelize,
    paranoid: true,
    // 还可以给 `deletedAt` 字段自定义名字
    deletedAt: "destroyTime"
  }
)
```



## 删除

当调用 `destory` 时，执行*软删除*。如果添加 `force: true` 选项，则执行*硬删除*。

```javascript
await Post.destory({ where: { id: 1 } });
// UPDATE "posts" SET "deletedAt" = CURRENT_TIMESTAMP WHERE "deletedAt" IS NULL AND "id" = 1
await Post.destory({
  where: { id: 1 },
  force: true
});
// DELETE FROM "posts" WHERE "id" = 1
```



## 恢复

*paranoid table* 的数据可以用 `restore` 方法恢复，该方法有静态方法和实例方法两个版本：

```javascript
const post = await Post.create({ title: "test" });
await post.destroy();
console.log("soft-deleted!");
await post.restore();
console.log("restored!");

// 使用静态方法，也可以根据条件恢复多条数据
await Post.restore({
  where: {
    likes: {
      [Op.gt]: 100
    }
  }
});
```

