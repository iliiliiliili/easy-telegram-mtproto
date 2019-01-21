
const fs = require ('fs');
const loginData = require ('./login-data.json');

const randomInt = (minValue, maxValue) =>
    minValue + Math.floor (Math.random () * (maxValue - minValue));
const delay = (ms) => new Promise (res => setTimeout (res, ms));

const saveAsJson = (fileName, data) => {

    fs.writeFileSync (fileName, JSON.stringify (data));
};

const save = (...args) => fs.writeFileSync (...args);
const read = (fileName) => fs.readFileSync (fileName, 'utf8');

const readAsJson = (fileName) => {

    if (fs.existsSync (fileName)) {

        return JSON.parse (read (fileName));
    }

    return null;
};

const isNumber = (val) => !isNaN (val);

const splitString = (string, size, multiline = true) => {

    const matchAllToken = (multiline === true) ? '[^]' : '.';
    const re = new RegExp (matchAllToken + '{1,' + size + '}', 'g');
    return string.match (re);
};

module.exports = {

    save,
    read,
    saveAsJson,
    readAsJson,
    loginData,
    isNumber,
    delay,
    splitString,
    randomInt,
};
