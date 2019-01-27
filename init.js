process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
});

const mysql = require('mysql');
const nodesu = require('nodesu');

const credentials = require('./credentials.json');

const osuApi = new nodesu.Client(credentials.OSU_API_KEY);

var connection = mysql.createPool(credentials.MYSQL);

function fetchMapset(mapset_id){
    osuApi.beatmaps.getBySetId(mapset_id).then(beatmaps => {
        if(beatmaps.length == 0){
            console.log('/s/', mapset_id, 'not found');
            setTimeout(function(){ fetchMapset(++mapset_id); }, 250);
        }

	console.log(beatmaps);

        beatmaps.forEach(function(b, index){
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
                 b.difficultyrating, b.favourite_count, b.playcount, b.passcount], function(err){
                    if(err) console.error(err);
                    else console.log('inserted', b.beatmap_id, b.artist, ' - ', b.title, '[', b.version, ']');
                    if(index + 1 == beatmaps.length)
                        setTimeout(function(){ fetchMapset(++mapset_id); }, 250);
                 });
        });

    }).catch(() => {
        console.log('/s/', mapset_id, 'not found');
        setTimeout(function(){ fetchMapset(++mapset_id); }, 500);
    });
}

connection.query('SELECT beatmapset_id FROM beatmap ORDER BY beatmapset_id DESC LIMIT 1', function(err, results){
    if(err) throw err;
    //fetchMapset(216902);
    fetchMapset(results[0].beatmapset_id + 1);
});
