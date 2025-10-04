// cliente.js
module.exports = (sequelize, Sequelize) => {
    const Cliente = sequelize.define("cliente", {
        id_cliente: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nit: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        nombre: {
            type: Sequelize.STRING,
            allowNull: false
        },
        placa: {
            type: Sequelize.STRING,
            allowNull: false
        }
    });

    Cliente.associate = (models) => {
        Cliente.hasMany(models.ticket, { foreignKey: 'id_cliente', as: 'tickets' });
    };

    return Cliente;
};
