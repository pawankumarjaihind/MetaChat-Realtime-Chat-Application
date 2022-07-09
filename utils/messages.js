const moment = require('moment');

function formatMessage(username,text) {
    return {
        username,
        text,
        time : moment().format('YYYY-MM-DD HH:mm')
    };
}
module.exports = formatMessage;