const bparser = require("bparser-js");
const path = require('path');
const fs = require('fs');
const util = require('util');

const mysql = require('mysql');
const config = require('../config.json');
const connection = mysql.createPool(config.MYSQL);
const runSql = util.promisify(connection.query).bind(connection);

let beatmap_path, beatmap, beatmap_id;


function calculateScore(){
    let score = 0;

    score = beatmap.maxScore;
    
    return score;
}

function calculateEyupStars(){
    const totalHitObjects = beatmap.countCircles + 2 * beatmap.countSliders + 3 * beatmap.countSpinners;
    const noteDensity = totalHitObjects / beatmap.drainLength;

    let difficulty, eyupStars;

    if (totalHitObjects == 0 || beatmap.timingPoints.length == 0) {
        return 0;
    }

    if (beatmap.countSliders / totalHitObjects < 0.1) {
        difficulty = beatmap.hp + beatmap.od + beatmap.cs;
    } else {
        difficulty = 
        (beatmap.hp + beatmap.od + beatmap.cs +
        Math.max(0, (Math.min(4, 1000 / beatmap.timingPoints[0].beatLength * Number(beatmap.sliderMultiplier) - 1.5) * 2.5))) * 0.75;
    }

    if (difficulty > 21) {
        // this part is slightly modified from the original formula:
        // eyupStars = (Math.min(difficulty, 30) / 3 * 4 + Math.min(20 - 0.032 * Math.pow(noteDensity - 5, 4), 20)) / 10;
        // -> causes star rating to go down above a certain density hence I capped density
        eyupStars = (Math.min(difficulty, 30) / 3 * 4 + Math.min(20 - 0.032 * Math.pow(Math.min(5, noteDensity) - 5, 4), 20)) / 10;
    } else if (noteDensity >= 2.5) {
        eyupStars = (Math.min(difficulty, 18) / 18 * 10 +
                Math.min(40 - 40 / Math.pow(5, 3.5) * Math.pow((Math.min(noteDensity, 5) - 5), 4), 40)) / 10;
    } else if (noteDensity < 1) {
        eyupStars = (Math.min(difficulty, 18) / 18 * 10) / 10 + 0.25;
    } else  {
        eyupStars = (Math.min(difficulty, 18) / 18 * 10 + Math.min(25 * (noteDensity - 1), 40)) / 10;
    }

    return Math.min(5, eyupStars);
}

async function prepareBeatmap(){

    beatmap = new bparser.BeatmapParser(beatmap_path);

    beatmap.cs = beatmap.cs != null ? beatmap.cs : 5;
    beatmap.od = beatmap.od != null ? beatmap.od : 5;
    beatmap.ar = beatmap.ar != null ? beatmap.ar : beatmap.od;
    beatmap.hp = beatmap.hp != null ? beatmap.hp : beatmap.od;

    beatmap.cs = Number(beatmap.cs);
    beatmap.od = Number(beatmap.od);
    beatmap.ar = Number(beatmap.ar);
    beatmap.hp = Number(beatmap.hp);
    
    beatmap.DifficultyPoints = beatmap.cs + beatmap.od + beatmap.hp;    
      
    const score = calculateScore();
    const eyupStars = calculateEyupStars();
    
    await runSql('UPDATE beatmap SET max_score = ?, eyup_star_rating = ? WHERE beatmap_id = ?', [score, eyupStars, beatmap_id]);
}

process.on('message', obj => {
    ({beatmap_path, beatmap_id} = obj);

    prepareBeatmap().then(() => {
        process.send(beatmap, () => {
            process.exit();
        });
    })
});
