const request = require('request');
const cheerio = require('cheerio');
const net = require('net');
const fs = require('fs');

let current_event = 0;
let last_event = 0;
let socket;

const BEATMAP_TYPES = [
    '</b> has updated the beatmap ', 
    '</b> has submitted a new beatmap ', 
    '</b> has just been ranked!', 
    '</b> has just been qualified!', 
    '</a> has been deleted.',
    '</a> has been revived from eternal slumber by ',
    '</b> achieved ',
    '</b> has lost first place on '
];

const BEATMAP_TYPE_NAMES = [
    'update',
    'creation',
    'rank',
    'qualification',
    'deletion',
    'revival',
    'score',
    'lost_first_place'
];

function submitEvent(json){
    let event = JSON.stringify(json);
    if(last_event != event) socket.write(event);
    last_event = event;
    
}

function parseEvent(html){
    let $ = cheerio.load(html);
    let event = { type: 'unknown', raw: html };
    
    $('a').each(function(){
        let element = $(this);
        let href = $(this).attr('href');
        
        let id = href.split('/').pop();
        let text = element.text();
        
        if(href.startsWith('/u')){
            event.user_id = id;
            event.username = text;
            
        }else if(href.startsWith('/s')){
            event.beatmapset_id = id;
            event.beatmap = text;
            
        }
    });
    
    if(new RegExp(BEATMAP_TYPES.join('|')).test(html)){
        event.type = 'beatmap';
        
        BEATMAP_TYPES.forEach(function(type, index){
            if(html.includes(type)){
                let type = BEATMAP_TYPE_NAMES[index];
                event.type = type;
                
                if(type == 'score'){
                    let rank = html
                               .split('</b> achieved rank #')
                               .pop()
                               .split('</b> achieved <b>rank #')
                               .pop()
                               .split(' ')[0]
                               .split('</b>')[0];
                    
                    event.rank = rank;
                    
                }
            }
            
        });
    }
    
    if(html.includes('</b> has received the gift of osu! supporter!'))
        event.type = 'supporter_gift';
    
    if(html.includes(' - thanks for your generosity!'))
        event.type = 'supporter_buy';
    
    if(html.includes('</b> has changed their username to ')){
        event.type = 'namechange';
        let new_username = html
                           .split('</b> has changed their username to ')
                           .pop()
                           .split('!')[0];
                           
        event.username_old = event.username;
        event.username = new_username;
        
    }
    
    if(html.includes('</b> unlocked the "')){
        event.type = 'medal';
        let medal = html
                    .split('"<b>')
                    .pop()
                    .split('</b>"')[0];
        event.medal = medal;
    }
    
    submitEvent(event);
    
}

function retryEvent(id){
    setTimeout(() => fetchEvent(id), 1000);
    
}

function fetchEvent(id){
    request(`https://osu.ppy.sh/pages/include/eventfeed.php?i=${id}`, (err, response, body) => {
        if(err){
            console.log(err);
            retryEvent(id);
            
        }else{
            if(response.statusCode == 200){
                let split = body.split("\n");
                let number = parseInt(split[0]);
                
                if(split.length > 1){
                    parseEvent(split[2]);
                    fetchEvent(++number);
                    
                }else{
                    retryEvent(number);
                    
                }
            }else{
                console.log(body);
                retryEvent(id);
                
            }
        }
    });
    
}

const server = net.createServer((c) => {
    socket = c;
    
});


server.listen('/var/run/osu-events.socket', () => {
    console.log("osu event socket started");

    let client = net.createConnection("/var/run/osu-events.socket", () => {
        console.log("osu event client started");
        fetchEvent(current_event);
        
    });
    
});

function exitHandler(type){
    server.close();
    process.exit();
    
}

[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
  process.on(eventType, exitHandler.bind(null, eventType));
})
