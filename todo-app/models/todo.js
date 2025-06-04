"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static addTodo({ title, dueDate }) {
      // Validation
      if (!title || title.trim() === '') {
        throw new Error('Title cannot be empty');
      }
      if (!dueDate) {
        throw new Error('Due date cannot be empty');
      }
      
      return this.create({ 
        title: title.trim(), 
        dueDate: dueDate, 
        completed: false 
      });
    }

    markAsCompleted() {
      return this.update({ completed: true });
    }

    setCompletionStatus(status) {
      return this.update({ completed: status });
    }
  }
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Title cannot be empty"
          }
        }
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Due date cannot be empty"
          }
        }
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
