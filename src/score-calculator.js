 
const osuBeatmapParser = require('osu-parser');
const path = require('path');
const fs = require('fs');
const util = require('util');

const mysql = require('mysql');
const config = require('../config.json');
const connection = mysql.createPool(config.MYSQL);
const runSql = util.promisify(connection.query).bind(connection);

let beatmap_path, beatmap, beatmap_id;

function processBeatmap(){
    for(const hitObject of beatmap.hitObjects){
        if(hitObject.objectName == "spinner"){
            hitObject.duration = hitObject.endTime - hitObject.startTime;
            
            let spinsPerSecond = 5;

            if(beatmap.OverallDifficulty > 5)
                spinsPerSecond = 5 + 2.5 * (beatmap.OverallDifficulty - 5) / 5;
            else
                spinsPerSecond = 5 - 2 * (5 - beatmap.OverallDifficulty) / 5;

            hitObject.spinsRequired = spinsPerSecond * (hitObject.duration / 1000);
        }

        if(hitObject.objectName == 'slider'){
            const scoringDistance = 100 * beatmap.SliderMultiplier * hitObject.velocity;
            const tickDistance = scoringDistance / beatmap.SliderTickRate;
            
            hitObject.countSliderTicks = 0;

            for(let x = tickDistance; x < hitObject.pixelLength; x += tickDistance){
                if(Math.round(x) == hitObject.pixelLength)
                    continue;
                
                hitObject.countSliderTicks++;
            }
        }
    }
}

function calculateScore(){
    let score = 0;
    let combo = 0;
    
    const multiplier = beatmap.ScoreMultiplier;
    
    for(const hitObject of beatmap.hitObjects){
        if(hitObject.objectName == "circle"){
            score += 300 + 300 * (Math.max(combo - 1, 0) * multiplier / 25);
            combo++;
        }else if(hitObject.objectName == "slider"){
            for(let i = 0; i < hitObject.repeatCount; i++){
                score += 30;
                combo++;
                
                for(let i = 0; i < hitObject.countSliderTicks; i++){
                    score += 10;
                    combo++;
                }
                
                if(i == hitObject.repeatCount - 1){
                    score += 30;
                    combo++;
                }
            }
            
            score += 300 + 300 * (Math.max(combo - 1, 0) * multiplier / 25);
        }else if(hitObject.objectName == "spinner"){
            score += 100 * Math.floor(hitObject.spinsRequired);
            score += 300 + 300 * (Math.max(combo - 1, 0) * multiplier / 25);
            combo++;
        }
        
        if(score > 2147483647){
            score = 1000000;
            break;
        }
    }
    
    return score;
}

async function prepareBeatmap(){
    const osuContents = await fs.promises.readFile(beatmap_path, 'utf8');

    beatmap = osuBeatmapParser.parseContent(osuContents);

    beatmap.CircleSize = beatmap.CircleSize != null ? beatmap.CircleSize : 5;
    beatmap.OverallDifficulty = beatmap.OverallDifficulty != null ? beatmap.OverallDifficulty : 5;
    beatmap.ApproachRate = beatmap.ApproachRate != null ? beatmap.ApproachRate : beatmap.OverallDifficulty;
    beatmap.HPDrainRate = beatmap.HPDrainRate != null ? beatmap.HPDrainRate : beatmap.OverallDifficulty;
    
    beatmap.DifficultyPoints = Number(beatmap.CircleSize) + Number(beatmap.OverallDifficulty) + Number(beatmap.HPDrainRate);
    
    const nobjects = beatmap.nbCircles + beatmap.nbSliders + beatmap.nbSpinners;    
    
    beatmap.ScoreMultiplier = Math.round(
        (beatmap.DifficultyPoints
        + Math.min(Math.max(nobjects / beatmap.drainingTime * 8, 0), 16)) 
        / 38 * 5
    );

    processBeatmap();
    
    const score = calculateScore();
    
    await runSql('UPDATE beatmap SET max_score = ? WHERE beatmap_id = ?', [score, beatmap_id]);
}

process.on('message', obj => {
    ({beatmap_path, beatmap_id} = obj);

    prepareBeatmap().then(() => {
        process.send(beatmap, () => {
            process.exit();
        });
    })
});
