# osu-beatmap-database
tool for keeping an up-to-date database of all ranked/approved/loved/qualified beatmaps with their difficulty data and max possible score

### Prerequisites
- Linux system with root access
- MySQL Server (recommendation: https://mariadb.org/), should be set up for root access without password otherwise you need to edit setup.sh
- [Node.js](https://nodejs.org/)
- [Microsoft .NET 6.0.400+](https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/en-us/download/dotnet/6.0)
  - Make sure to use [dotnet-install](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-install-script) instead of your package manager to get the latest version.
  - Arch Linux: `yay -S dotnet-install` -> `sudo dotnet-install --install-dir /usr/share/dotnet -v 6.0.418`
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

### Updating and recalculating

#### First-time only:
Install dependencies `jq screen` (Arch Linux: `sudo pacman -Sy jq screen`).

```Bash
cd files
git clone https://github.com/ppy/osu.git
cd osu-difficulty-calculator
./UseLocalOsu.sh
```
If you run this as a user (which you should), you'll also have to let it access the build files (example user `osudb`) since they were created as root:
```Bash
sudo chown -R osudb:osudb /home/osudb/files/
```

#### Every time:

Check [this](https://github.com/ppy/osu-infrastructure/wiki/Star-Rating-and-Performance-Points) for the current deployment versions.
```Bash
cd files/osu
git checkout <current osu deployment version>
cd ..
cd osu-difficulty-calculator
git checkout <current osu-difficulty-calculator deployment version>
dotnet build --configuration Release
cd ../..
screen -dmS recalc bash -c "DB_USER=`jq -r '.MYSQL.user' ./config.json` BEATMAPS_PATH=`jq -r '.OSU_FILES_PATH' ./config.json` dotnet `jq -r '.OSU_DIFFCALC_PATH' ./config.json` all -ac -c `nproc`"
```
Check progress with `screen -r recalc` (exit with Ctrl+A D). If the screen no longer exists it finished.
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
