const mongoose = require("mongoose");

class DBService {
    static instance = null;

    constructor() {
        if (DBService.instance) return DBService.instance;
        DBService.instance = this;
    }

    static getInstance() {
        if (!DBService.instance) {
            DBService.instance = new DBService();
            mongoose.connect(process.env.MONGODB_URI, {
                autoIndex: true,
                connectTimeoutMS: 10000,
            });
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
        if (connection) await connection.commitTransaction();
    }

    async rollbackTransaction(connection) {
        if (connection) await connection.abortTransaction();
    }

    async endTransaction(connection) {
        if (connection) await connection.endSession();
    }

    async insertOne(model, data, connection) {
        return await model.create([data], { session: connection });
    }

    async insertMany(model, data, connection) {
        return await model.insertMany(data, { session: connection });
    }

    async find(
        model,
        options = {
            one: false,
            query: {},
            exclude: {},
            sort: null,
            limit: null,
            skip: null,
        },
        connection
    ) {
        const { one, query, exclude, sort, limit, skip } = options;

        let queryBuilder = one
            ? model.findOne(query, exclude)
            : model.find(query, exclude);

        if (sort) queryBuilder = queryBuilder.sort(sort);
        if (limit !== null && limit !== undefined)
            queryBuilder = queryBuilder.limit(limit);
        if (skip !== null && skip !== undefined)
            queryBuilder = queryBuilder.skip(skip);
        if (connection) queryBuilder = queryBuilder.session(connection);

        return await queryBuilder.exec();
    }

    async update(
        model,
        options = { query: {}, data: {}, one: false, upsert: false },
        connection
    ) {
        if (options.one) {
            return await model.findOneAndUpdate(options.query, options.data, {
                new: true,
                upsert: options.upsert,
                session: connection,
            });
        }

        return await model.updateMany(options.query, options.data, {
            upsert: options.upsert,
            session: connection,
        });
    }

    async count(model, filter, connection) {
        let q = model.countDocuments(filter);
        if (connection) q = q.session(connection);
        return await q.exec();
    }

    async delete(model, options = { query: {}, one: false }, connection) {
        let query = options.one
            ? model.findOneAndDelete(options.query)
            : model.deleteMany(options.query);

        if (connection) query = query.session(connection);
        return await query.exec();
    }
}

module.exports = DBService;
