const mongoose = require("mongoose");

class DBService {
    static instance = null;
    connection = null;

    constructor() {
        if (DBService.instance) return DBService.instance;
        DBService.instance = this;
    }

    static getInstance() {
        if (!DBService.instance) {
            DBService.instance = new DBService();
            mongoose.connect(
                process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/test",
                {
                    autoIndex: true,
                    connectTimeoutMS: 10000,
                }
            );
            console.log("CONNECTED TO MONGODB");
        }
        return DBService.instance;
    }

    async getConnection() {
        return await mongoose.startSession();
    }

    async startTransaction(connection) {
        if (!connection) connection = await this.getConnection();
        await connection.startTransaction();
        return connection;
    }

    async commitTransaction(connection) {
        if (!connection) return;
        await connection.commitTransaction();
    }

    async rollbackTransaction(connection) {
        if (!connection) return;
        await connection.abortTransaction();
    }

    async endTransaction(connection) {
        if (!connection) return;
        await connection.endSession();
    }

    async insert(model, data) {
        const row = new model(data);
        const saved = await row.save();
        return saved;
    }

    async find(model, options = { one: false, query: {}, exclude: {} }) {
        if (options.one) {
            return await model.findOne(options.query, options.exclude);
        }
        return await model.find(options.query, options.exclude);
    }

    async update(
        model,
        options = { query: {}, data: {}, one: false, upsert: false }
    ) {
        if (options.one) {
            return await model.findOneAndUpdate(options.query, options.data, {
                new: true,
                upsert: options.upsert,
            });
        } else {
            // Update multiple documents
            return await model.updateMany(options.query, options.data, {
                upsert: options.upsert,
            });
        }
    }

    async count(model, query) {
        return await model.countDocuments(query);
    }
}

module.exports = DBService;
