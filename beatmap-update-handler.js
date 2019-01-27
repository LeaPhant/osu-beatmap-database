process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

const DEBUG = true;

const mysql = require('mysql');
const nodesu = require('nodesu');
const net = require('net');

const credentials = require('./credentials.json');

const osuApi = new nodesu.Client(credentials.OSU_API_KEY);

var connection = mysql.createPool(credentials.MYSQL);

function deleteBeatmap(data){
    let query = `
        DELETE FROM beatmap
        WHERE beatmapset_id = ?
    `;
    
    connection.query(query, [data.beatmapset_id], err => {
        if(err) console.log(err);
        else if(DEBUG) console.log(data.beatmapset_id, 'deleted');
        
    });
    
}

function createBeatmap(b){
    let query = `
        INSERT INTO beatmap
           (beatmap_id, beatmapset_id, approved, total_length, hit_length,
            version, artist, title, creator, creator_id, mode, cs, od, ar, hp,
            approved_date, last_updated_date, bpm, source, tags, genre_id,
            language_id, max_combo, star_rating, favorites, plays, passes)
        VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(query,
        [b.beatmap_id, b.beatmapset_id, b.approved, b.total_length, b.hit_length,
            b.version, b.artist, b.title, b.creator, b.creator_id, b.mode, b.diff_size,
            b.diff_overall, b.diff_approach, b.diff_drain, b.approved_date, b.last_update,
            b.bpm, b.source, b.tags, b.genre_id, b.language_id, b.max_combo,
            b.difficultyrating, b.favourite_count, b.playcount, b.passcount], err => {
                if(err) console.error(err);
                else if(DEBUG) console.log(b.beatmap_id, 'inserted');
            });
    
}

function updateBeatmap(b){
    let query = `
        UPDATE beatmap SET
            beatmapset_id = ?, approved = ?, total_length = ?, hit_length = ?,
            version = ?, artist = ?, title = ?, creator = ?, creator_id = ?, 
            mode = ?, cs = ?, od = ?, ar = ?, hp = ?,
            approved_date = ?, last_updated_date = ?, bpm = ?, source = ?, tags = ?, genre_id = ?,
            language_id = ?, max_combo = ?, star_rating = ?, favorites = ?, plays = ?, passes = ?,
            recalculate = 1
        WHERE
            beatmap_id = ?
    `;
    
    connection.query(query,  
       [b.beatmapset_id, b.approved, b.total_length, b.hit_length,
        b.version, b.artist, b.title, b.creator, b.creator_id, b.mode, b.diff_size,
        b.diff_overall, b.diff_approach, b.diff_drain, b.approved_date, b.last_update,
        b.bpm, b.source, b.tags, b.genre_id, b.language_id, b.max_combo,
        b.difficultyrating, b.favourite_count, b.playcount, b.passcount, b.beatmap_id], err => {
            if(err) console.log(err);
            else if(DEBUG) console.log(b.beatmap_id, 'updated');
            
        });
    
}

function handleDeletion(data){
    deleteBeatmap(data);
    
}

function handleUpdateCreation(data){
    let query = `SELECT COUNT(beatmapset_id) as c FROM beatmap WHERE beatmapset_id = ?`;
    
    connection.query(query, [data.beatmapset_id], (err, results) => {
        if(err){
            console.log(err);
        }else{
            osuApi.beatmaps.getBySetId(data.beatmapset_id).then(beatmaps => {
                try{
                    if(results[0].c > 0)
                        beatmaps.forEach(updateBeatmap);
                    else
                        beatmaps.forEach(createBeatmap);
                }catch(e){
                    console.log(e);
                    
                }
                
            });
            
        }
        
    });
    
    
}

function handleEvent(raw){
    let data = JSON.parse(raw.toString());
    
    switch(data.type){
        case 'update':
        case 'rank':
        case 'qualification':
        case 'revival':
        case 'creation':
            handleUpdateCreation(data);
            break;
        case 'deletion':
            handleDeletion(data);
            break;
            
    }
    
}

const client = net.createConnection("/var/run/osu-events.socket", () => {
    console.log("osu event client started");
    
});


client.on('data', handleEvent);
