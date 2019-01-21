/* eslint-disable camelcase */

const initTelegramMtproto = require ('./telegram-mtproto.js');
const {loginData, save, saveAsJson, read, randomInt} = require ('./core.js');

class InputPeer {

    constructor (target) {

        switch (target._ || target.type) {

            case 'user':
                this ['_'] = 'inputPeerUser';
                this.user_id = target.id;
                this.access_hash = target.access_hash;
                break;
            case 'channel':
                this ['_'] = 'inputPeerChannel';
                this.channel_id = target.id;
                this.access_hash = target.access_hash;
                break;
            case 'chat':
                this ['_'] = 'inputPeerChat';
                this.chat_id = target.id;
                break;
            case 'chatForbidden':
                this ['_'] = 'chatForbidden';
                this.chat_id = target.id;
                break;
        
            default:
                throw new Error (`Unknown target type: '${target._}'`);
        }
    }
}

// class InputMedia {

//     constructor (target) {

//         console.log ({target});

//         const type = target._ || target.type;
//         const id = target.id || (target.photo || target.document).id;
//         const access_hash = target.access_hash ||
//             (target.photo || target.document).access_hash;

//         const resultType = type.replace ('message', 'input');
    
//         this ['_'] = resultType;

//         this.id = {
//             id: parseInt (id),
//             access_hash: parseInt (access_hash),
//         };

//         console.log (this);
//     }
// }

class TelegramClient {

    constructor (apiId, apiHash, name, getPhone, getCode,
        getRandomMessageId, storageFolder) {

        this.apiId  = apiId;
        this.apiHash = apiHash;
        this.name = name;
        this.getPhone = getPhone;
        this.getCode = getCode;
        this.createSendMessageId = getRandomMessageId ||
            (() => randomInt (11, 8000000007));
        this.telegramMtproto = initTelegramMtproto (this.apiId,
            this.name, storageFolder);
    }

    static asInputPeer (...args)  {

        if (args.length === 1) {

            return new InputPeer (...args);
        } else {

            return args.map (a => new InputPeer (a));
        }
    }

    // static asInputMedia (...args)  {

    //     if (args.length === 1) {

    //         return new InputMedia (args [0]);
    //     } else {

    //         return args.map (a => new InputMedia (a));
    //     }
    // }

    async processLogin () {

        console.log ('Logging in...');
        const phone = await this.getPhone ();
        const {phone_code_hash} = await this.telegramMtproto ('auth.sendCode', {
            phone_number: phone,
            current_number: true,
            api_id: loginData.app.api_id,
            api_hash: loginData.app.api_hash,
        });

        const code = await this.getCode ();
        
        const res = await this.telegramMtproto ('auth.signIn', {
            phone_number: phone,
            phone_code_hash,
            phone_code: code
        });

        const {user} = res;
        
        console.log (['Logged in as: ', user]);

        return res;
    }

    async login () {

        if (read (this.telegramMtproto.storage.file).substr (0, 2) !== '{}') {
    
            console.log ('Already logged in Telegram as:' + this.name);
        } else {
    
            await this.processLogin ();
        }
    }

    async getChats () {
    
        const dialogs = await this.telegramMtproto ('messages.getDialogs', {
    
            limit: 1000,
        });
        
        const {chats, users} = dialogs;
    
        users.forEach (user => {
    
            user.display = () => {
              
                let res = '';
                res += user.first_name;
    
                if (user.last_name !== undefined) {
    
                    res += ' ' + user.last_name;
                }
                
                if (user.username !== undefined) {
    
                    res += ' @' + user.username;
                }
    
                return res;
            };
        });
    
        chats.forEach (chat => {
    
            chat.display = () => {
              
                let res = '';
                res += chat.title;
                
                if (chat.username !== undefined) {
    
                    res += ' @' + chat.username;
                }
    
                return res;
            };
        });
    
        return [...users, ...chats];
    }

    async getAndSaveChatsData (jsonFileName = 'chats.json',
        txtFileName = 'chats.txt') {

        const chats = await this.getChats ();
    
        const chatsData = chats.map (chat => {
    
            const result = {
            
                display: chat.display (),
                id: chat.id,
                type: chat._,
            };
    
            if (chat.access_hash !== undefined) {
    
                result.access_hash = chat.access_hash;
            }
    
            return result;
        });
    
        saveAsJson (jsonFileName, chatsData);
        save (txtFileName, chatsData.reduce ((acc, val) =>
            acc + val.type + ' ' + val.display + ' | id: ' +
            val.id + '\r\n', 'Chats:\r\n'));
    
        return chatsData;
    }

    async call (...args) {
        
        return this.telegramMtproto (...args);
    }

    async chatHistory (chat) {
    
        const max = 400;
        const limit = 100;
        let offset = 0;
        let full = [];
        let messages = [];
        
        do {
    
            const history = await this.telegramMtproto ('messages.getHistory', {
                peer: new InputPeer (chat),
                max_id: offset,
                offset: -full.length,
                limit
            });
            messages = history.messages;
            full = full.concat (messages);
            messages.length > 0 && (offset = messages[0].id);
        } while (messages.length === limit && full.length < max);
        
        return full;
    }

    async forwardMessages (from, to, messages) {
        
        return this.telegramMtproto ('messages.forwardMessages', {
            from_peer: new InputPeer (from),
            to_peer: new InputPeer (to),
            random_id: messages.map (() => this.createSendMessageId ()),
            id: messages.map (m => m.id),
        });
    }

    async deleteMessagesFromChannel (from, messages) {

        return this.telegramMtproto ('channels.deleteMessages', {
            channel: new InputPeer (from),
            id: messages.map (m => m.id),
        });
    }

    async sendMessage (target, message) {
        
        return this.telegramMtproto ('messages.sendMessage', {
            peer: new InputPeer (target),
            random_id: this.createSendMessageId (),
            message,
        });
    }

    // async sendMediaMessage (target, media, message = '') {

    //     return this.telegramMtproto ('messages.sendMedia', {
    //         peer: new InputPeer (target),
    //         random_id: this.createSendMessageId (),
    //         media: new InputMedia (media),
    //         message,
    //     });
    // }
}


module.exports = TelegramClient;
