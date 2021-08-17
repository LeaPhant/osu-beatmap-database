# osu-beatmap-database
tool for keeping an up-to-date database of all ranked/approved/loved/qualified beatmaps with their difficulty data and max possible score

### Prerequisites
- Linux system with root access
- MySQL Server (recommendation: https://mariadb.org/), should be set up for root access without password otherwise you need to edit setup.sh
- [Node.js](https://nodejs.org/)
- [Microsoft .NET](https://dotnet.microsoft.com/download) (runs on all platforms)
- osu! API Key (get one [here](https://osu.ppy.sh/p/api))

### Setup

```Bash
git clone https://github.com/LeaPhant/osu-beatmap-database.git
cd osu-beatmap-database
npm i
sudo npm -g i pm2
chmod +x ./setup.sh
./setup.sh # sets up database and osu-difficulty-calculator, will ask for root password
node init # generates config and asks for osu! api key, then does checks
```

Then start the service to keep the beatmaps up-to-date and run the http server

```Bash
pm2 start --name osu-beatmap-database ./src/index
```

### API

Unless you changed the port the API will be available on http://127.0.0.1:16791 with the following endpoints:

#### `/b/BEATMAP_ID?mode=0-3` (accepts multiple comma-separated beatmap ids)

Returns info and difficulty data for one or more beatmaps

#### `/beatmaps?mode=0&from=2013&to=2016&star_rating=3-5&tags=lucky,star`

Returns arrays with beatmap ids of all ranked/approved, loved and qualified beatmaps + the beatmap info for the newest map of each category

--- 

`mode` is a number from 0-3 where 0 is standard, 1 is taiko, 2 is catch the beat and 3 is mania. Passing this parameter will return data for the convert. If left out it assumes standard, unless it's a map specifically mapped for another mode.

`from` is a date in ISO 8601 format. Using just a year defaults to January 1.

`to` is a date in ISO 8601 format. Using just a year defaults to January 1.

`star_rating` is a range between two numbers. Can also be a single number used as difficulty range.

`tags` are tags separated by "," searching the database similar to the in-game search.
