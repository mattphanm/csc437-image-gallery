import { ObjectId } from "mongodb";
import { getEnvVar } from "./getEnvVar.js";

export class ImageProvider {
    constructor(mongoClient) {
        this.mongoClient = mongoClient;
        const collectionName = getEnvVar("IMAGES_COLLECTION_NAME");
        this.collection = this.mongoClient.db().collection(collectionName);
        this.usersCollectionName = getEnvVar("USERS_COLLECTION_NAME");
    }

    buildDenormalizedPipeline(matchStage) {
        const pipeline = [];
        if (matchStage) {
            pipeline.push({ $match: matchStage });
        }

        pipeline.push({
            $lookup: {
                from: this.usersCollectionName,
                localField: "authorId",
                foreignField: "username",
                as: "author",
            },
        });
        pipeline.push({
            $addFields: {
                author: { $first: "$author" },
            },
        });
        pipeline.push({
            $project: {
                _id: { $toString: "$_id" },
                src: 1,
                name: 1,
                author: {
                    _id: { $ifNull: [{ $toString: "$author._id" }, null] },
                    username: "$author.username",
                    email: "$author.email",
                },
            },
        });

        return pipeline;
    }

    getAllImages() {
        const pipeline = this.buildDenormalizedPipeline();
        return this.collection.aggregate(pipeline).toArray();
    }

    async getOneImage(imageId) {
        const pipeline = this.buildDenormalizedPipeline({ _id: new ObjectId(imageId) });
        const images = await this.collection.aggregate(pipeline).toArray();
        return images[0] ?? null;
    }

    async updateImageName(imageId, newName) {
        const updateResult = await this.collection.updateOne(
            { _id: new ObjectId(imageId) },
            { $set: { name: newName } },
        );
        return updateResult.matchedCount;
    }
}
