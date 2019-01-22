# Easy Telegram Mtproto
- Easy interfase for telegram-mtproto  

### Install
```npm install easy-telegram-mtproto```

### Examples

```js
const TelegramClient = require ('easy-telegram-mtproto');
const data = require ('./login-data.json');

const main = async () => {

    console.log (data);

    const client = new TelegramClient (data.app.api_id, data.app.api_hash,
        data.phone,
        async () => data.phone,
        () => {

            const readline = require ('readline');

            const rl = readline.createInterface ({
                input: process.stdin,
                output: process.stdout
            });

            return new Promise (resolve => {

                rl.question ('Code', (answer) => {

                    rl.close ();
                    resolve (answer);
                });
            });
        });

    await client.login ();

    const chats = await client.getChats ();
    const me = chats.find ((chat) => chat.self);

    console.log (me);

    client.sendMessage (me, 'Hello, is it me you\'re looking for?');
};

main ();

````

### Methods

- ```TelegramClient (apiId, apiHash, name, getPhone, getCode, getRandomMessageId, storageFolder)```
    - apiId and apiHash you can get from [telegram website](https://my.telegram.org/auth?to=apps).
    - name is needed to save login keys.
    - getPhone and getCode are async functions that are called when phone number or telegram login code are required.
    - getRandomMessageId is called when message random_id is required
    - storageFolder to save login keys.
- ```async asInputPeer (...args)``` converts chat object to InputPeer
- ```async login ()``` logs in telegram if was not logged in before
- ```async getChats ()``` returns list of all chats (max 1000)
- ```async getAndSaveChatsData (jsonFileName = 'chats.json', txtFileName = 'chats.txt')``` gets short chats data and saves it to file
- ```async chatHistory (chat)``` reads all history from chat
- ```async forwardMessages (from, to, messages)``` forwardes messages from on chat to another
- ```async deleteMessagesFromChannel (from, messages)``` deletes selected message from channel or supergroup
- ```async sendMessage (target, message)``` sends message to chat
- ```async call (...args)``` calls custom API method. [List of methods](https://core.telegram.org/methods)
```js
await client.call ('messages.sendMessage', {
    peer: TelegramClient.asInputPeer (target),
    random_id,
    message,
});
````