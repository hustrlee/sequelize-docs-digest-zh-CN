const { Sequelize, Model, DataTypes } = require("sequelize");
const sequelize = new Sequelize("mysql://root:root@127.0.0.1/db", {
  timezone: "+08:00"
});

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

(async () => {
  const place = Place.build();
  place.latitude = 100; // latitude > 90
  // Place 定义时，指定 longitude 的缺省值为 null

  try {
    await place.validate();
    console.log("Successfully");
    console.log(res.toJSON());
  } catch (error) {
    console.log(error.message);
  } finally {
    sequelize.close();
  }
})();
