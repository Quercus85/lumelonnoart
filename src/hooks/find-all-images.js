const { Tags } = require("../services/tags/tags.class");

/* eslint-disable require-atomic-updates */
module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
    return async context => {
        console.log("START find-all-images hook");
        // Get `app`, `method`, `params` and `result` from the hook context
        const { app, method, result, params } = context;
        // Function that adds the user to a single message object
        const findedImages = async (allImages) => {
            // Get the user based on their id, pass the `params` along so
            // that we get a safe version of the user data
            const imgQuery = await app.service('images').findAll({include: Tags});
            // Merge the message content to include the `user` object
            return {
                ...allImages,
                imgQuery
            };
        };

        // In a find method we need to process the entire page
        if (method === 'find') {
            // Map all data to include the `images` information
            context.result.data = await Promise.all(result.data.map(findedImages));
        } else {
            // Otherwise just update the single result
            context.result = await findedImages(result);
        }
        console.log("STOP find-all-images hook");
        return context;
    };
};
