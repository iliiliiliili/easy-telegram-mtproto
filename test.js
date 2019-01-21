const TelegramClient = require ('./telegram-client.js');
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
