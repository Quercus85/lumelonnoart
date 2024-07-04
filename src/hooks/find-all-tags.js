const { Images } = require("../services/images/images.class");


/* eslint-disable require-atomic-updates */
module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
    return async context => {
        console.log("START find-all-tags hook");
        // Get `app`, `method`, `params` and `result` from the hook context
        const { app, method, result, params } = context;
        // Function that adds the user to a single message object
        const findedTags = async (allTags) => {
            // Get the user based on their id, pass the `params` along so
            // that we get a safe version of the user data
            const tagIds = params.query.id; // Assumi che i tagIds siano passati come parametro
            console.log("TAGSID:" + JSON.stringify(tagIds) + ", type " + typeof(tagIds) )
            const tagsQuery = null;
            if(tagIds > 0 ){
                tagsQuery = await app.service('tags').find({
                query: {
                 // id: { $in: tagIds } // Filtra per gli ID specificati
                 id:  tagIds  // Filtra per gli ID specificati
                }
              }); 
            }
            else if(tagIds == undefined || tagIds == null)
                tagsQuery = await app.service('tags').findAll();
            // Merge the message content to include the `user` object
            return {
                ...allTags,
                tagsQuery
            };
        };

        // In a find method we need to process the entire page
        if (method === 'find') {
            // Map all data to include the `images` information
            context.result.data = await Promise.all(result.data.map(findedTags));
        } else {
            // Otherwise just update the single result
            context.result = await findedTags(result);
        }
        console.log("STOP find-all-tags hook");
        return context;
    };
};