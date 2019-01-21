/* eslint-disable camelcase */

const mtproto = require ('telegram-mtproto').MTProto;
const {Storage} = require ('mtproto-storage-fs');

const init = (apiId, name, storageFolder = './storage') => {

    const api = {
        invokeWithLayer: 0xda9b0d0d,
        layer: 57,
        initConnection: 0x69796de9,
        api_id: apiId,
        app_version: '1.0.1',
        lang_code: 'en',
    };
    
    const server = {
        webogram: true,
        dev: false,
    };

    const app = {
        storage: new Storage (storageFolder + '/' + name + '.json')
    };

    return mtproto ({
        api,
        server,
        app
    });
};

module.exports = init;
