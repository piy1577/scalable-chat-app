const mongoose = require("mongoose");

jest.mock("mongoose");

describe("DBService", () => {
    let dbService;
    let mockConnection;
    let mockModel;
    let DBService;

    beforeEach(() => {
        jest.clearAllMocks();

        mockConnection = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn(),
        };

        mockModel = {
            create: jest.fn(),
            insertMany: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            findOneAndUpdate: jest.fn(),
            updateMany: jest.fn(),
            countDocuments: jest.fn(),
            findOneAndDelete: jest.fn(),
            deleteMany: jest.fn(),
        };

        mongoose.connect.mockResolvedValue();
        mongoose.startSession = jest.fn().mockResolvedValue(mockConnection);
        mockConnection.startTransaction.mockResolvedValue();
        mockConnection.commitTransaction.mockResolvedValue();
        mockConnection.abortTransaction.mockResolvedValue();
        mockConnection.endSession.mockResolvedValue();

        process.env.MONGODB_URI = "mongodb://test";

        DBService = require("../db.service.js");
        DBService.instance = null; // Reset singleton
        dbService = DBService.getInstance();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete process.env.MONGODB_URI;
    });

    test("should create a singleton instance", () => {
        const instance1 = dbService;
        const instance2 = dbService.constructor.getInstance();
        expect(instance1).toBe(instance2);
    });

    test("should connect to MongoDB", () => {
        expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URI, {
            autoIndex: true,
            connectTimeoutMS: 10000,
        });
    });

    test("should get connection", async () => {
        const connection = await dbService.getConnection();
        expect(mongoose.startSession).toHaveBeenCalled();
        expect(connection).toBe(mockConnection);
    });

    test("should start transaction", async () => {
        const connection = await dbService.startTransaction(mockConnection);
        expect(mockConnection.startTransaction).toHaveBeenCalled();
        expect(connection).toBe(mockConnection);
    });

    test("should start transaction without provided connection", async () => {
        const connection = await dbService.startTransaction();
        expect(mongoose.startSession).toHaveBeenCalled();
        expect(mockConnection.startTransaction).toHaveBeenCalled();
    });

    test("should commit transaction", async () => {
        await dbService.commitTransaction(mockConnection);
        expect(mockConnection.commitTransaction).toHaveBeenCalled();
    });

    test("should rollback transaction", async () => {
        await dbService.rollbackTransaction(mockConnection);
        expect(mockConnection.abortTransaction).toHaveBeenCalled();
    });

    test("should end transaction", async () => {
        await dbService.endTransaction(mockConnection);
        expect(mockConnection.endSession).toHaveBeenCalled();
    });

    test("should insert one document", async () => {
        const data = { name: "test" };
        mockModel.create.mockResolvedValue([data]);
        const result = await dbService.insertOne(mockModel, data, mockConnection);
        expect(mockModel.create).toHaveBeenCalledWith([data], { session: mockConnection });
        expect(result).toEqual([data]);
    });

    test("should insert many documents", async () => {
        const data = [{ name: "test1" }, { name: "test2" }];
        mockModel.insertMany.mockResolvedValue(data);
        const result = await dbService.insertMany(mockModel, data, mockConnection);
        expect(mockModel.insertMany).toHaveBeenCalledWith(data, { session: mockConnection });
        expect(result).toEqual(data);
    });

    test("should find documents - one", async () => {
        const query = { id: 1 };
        const mockResult = { name: "test" };
        const mockQueryBuilder = {
            exec: jest.fn().mockResolvedValue(mockResult),
            session: jest.fn().mockReturnThis(),
        };
        mockModel.findOne.mockReturnValue(mockQueryBuilder);
        const result = await dbService.find(mockModel, { one: true, query, exclude: {} }, mockConnection);
        expect(mockModel.findOne).toHaveBeenCalledWith(query, {});
        expect(mockQueryBuilder.session).toHaveBeenCalledWith(mockConnection);
        expect(result).toEqual(mockResult);
    });

    test("should find documents - many", async () => {
        const query = { id: 1 };
        const mockResult = [{ name: "test" }];
        const mockQueryBuilder = {
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            session: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockResult),
        };
        mockModel.find.mockReturnValue(mockQueryBuilder);
        const result = await dbService.find(mockModel, { query, exclude: {}, sort: { createdAt: -1 }, limit: 10, skip: 5 }, mockConnection);
        expect(mockModel.find).toHaveBeenCalledWith(query, {});
        expect(mockQueryBuilder.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
        expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
        expect(mockQueryBuilder.session).toHaveBeenCalledWith(mockConnection);
        expect(result).toEqual(mockResult);
    });

    test("should update one document", async () => {
        const options = { query: { id: 1 }, data: { name: "updated" }, one: true, upsert: false };
        const mockResult = { name: "updated" };
        mockModel.findOneAndUpdate.mockResolvedValue(mockResult);
        const result = await dbService.update(mockModel, options, mockConnection);
        expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(options.query, options.data, {
            new: true,
            upsert: false,
            session: mockConnection,
        });
        expect(result).toEqual(mockResult);
    });

    test("should update many documents", async () => {
        const options = { query: { id: 1 }, data: { name: "updated" }, upsert: false };
        const mockResult = { acknowledged: true, modifiedCount: 1 };
        mockModel.updateMany.mockResolvedValue(mockResult);
        const result = await dbService.update(mockModel, options, mockConnection);
        expect(mockModel.updateMany).toHaveBeenCalledWith(options.query, options.data, {
            upsert: false,
            session: mockConnection,
        });
        expect(result).toEqual(mockResult);
    });

    test("should count documents", async () => {
        const filter = { active: true };
        const mockResult = 5;
        mockModel.countDocuments.mockReturnValue({
            session: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockResult),
        });
        const result = await dbService.count(mockModel, filter, mockConnection);
        expect(mockModel.countDocuments).toHaveBeenCalledWith(filter);
        expect(result).toEqual(mockResult);
    });

    test("should delete one document", async () => {
        const options = { query: { id: 1 }, one: true };
        const mockResult = { name: "deleted" };
        const mockQuery = {
            session: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockResult),
        };
        mockModel.findOneAndDelete.mockReturnValue(mockQuery);
        const result = await dbService.delete(mockModel, options, mockConnection);
        expect(mockModel.findOneAndDelete).toHaveBeenCalledWith(options.query);
        expect(mockQuery.session).toHaveBeenCalledWith(mockConnection);
        expect(result).toEqual(mockResult);
    });

    test("should delete many documents", async () => {
        const options = { query: { id: 1 } };
        const mockResult = { acknowledged: true, deletedCount: 1 };
        const mockQuery = {
            session: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue(mockResult),
        };
        mockModel.deleteMany.mockReturnValue(mockQuery);
        const result = await dbService.delete(mockModel, options, mockConnection);
        expect(mockModel.deleteMany).toHaveBeenCalledWith(options.query);
        expect(mockQuery.session).toHaveBeenCalledWith(mockConnection);
        expect(result).toEqual(mockResult);
    });
});
