module.exports = function (str) {
    return str.substring(str.lastIndexOf("/") + 1).replace(/\_/g, ' ');
}
