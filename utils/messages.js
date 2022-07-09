const moment = require('moment');

function formatMessage(username,text) {
    return {
        username,
        text,
        time : moment().utcOffset("+05:30").format('YYYY-MM-DD HH:mm')
    };
}

module.exports = formatMessage;