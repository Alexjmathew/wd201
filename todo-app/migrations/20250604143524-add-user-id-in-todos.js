'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if the column already exists before adding it
    const tableDescription = await queryInterface.describeTable('Todos');
    
    if (!tableDescription.userId) {
      await queryInterface.addColumn('Todos','userId',{
        type:Sequelize.DataTypes.INTEGER  
      });
      
      await queryInterface.addConstraint('Todos',{
        fields:['userId'],
        type:'foreign key',
        references:{
          table:'Users',
          field:'id'
        }
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Todos','userId');
  }
};
