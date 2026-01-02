module.exports = async function (context, req) {
    context.log('Test function called');

    context.res = {
        status: 200,
        body: { 
            message: "Test function works!",
            timestamp: new Date().toISOString()
        }
    };
};
