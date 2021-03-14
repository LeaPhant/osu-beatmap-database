const mysql = require('mysql');
const fs = require('fs');
const util = require('util');
const readline = require('readline');
const fetch = require('node-fetch');

const exists = async path => {
    try{
        await fs.promises.access(path, fs.constants.F_OK);

        return true;
    }catch(e){
        return false;
    }
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = util.promisify(rl.question).bind(rl);

let config = {
    "HTTP_PORT": 16791,
    "OSU_API_KEY": "",
    "OSU_FILES_PATH": "./files/beatmaps",
    "OSU_DIFFCALC_PATH": "",
    "MYSQL": {
        "host": "localhost",
        "user": "osudb",
        "password": "",
        "database": "osu"
    }
};

async function main(){
    if(await exists('./config.json'))
        config = Object.assign(config, require('./config.json'));

    if(process.argv[2])
        config.OSU_DIFFCALC_PATH = process.argv[2];

    if(config.OSU_API_KEY == null || config.OSU_API_KEY.length == 0){
        try{
            config.OSU_API_KEY = await question('Enter osu! api key from https://osu.ppy.sh/p/api/: ');
        }catch(e){
            config.OSU_API_KEY = e;
        }
    }

    config.OSU_API_KEY = config.OSU_API_KEY.trim();

    console.log("trying to validate key...");

    try{
        const response = await fetch(`https://osu.ppy.sh/api/get_beatmaps?k=${config.OSU_API_KEY}&limit=1`);
        const json = await response.json();

        if(json.error){
            console.error("osu! api key couldn't be validated, api error below:");
            console.error(json.error);
        }else{
            console.log("osu! api key successfully passed validation check!");
        }
    }catch(e){
        console.error("couldn't validate osu! api key, maybe the api is currently unavailable");
        console.error(e);
    }

    const connection = mysql.createPool(config.MYSQL);
    const runSql = util.promisify(connection.query).bind(connection);

    try{
        await runSql('SELECT * FROM osu_difficulty_attribs');
        console.log("database set up correctly! everything should be good to go")
    }catch(e){
        console.error("couldn't connect to database:");
        console.error(e.toString());
    }finally{
        connection.end();
    }

    await fs.promises.writeFile('./config.json', JSON.stringify(config, null, 2));

    await rl.close();
    return;
}

main();