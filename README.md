### Disclaimer

Using the event feed for beatmap updates is [apparently incomplete](https://twitter.com/LazeyLea/status/1089718571330990080), as such this project is currently on hold until I'll find a better solution for keeping up to date without brute forcing.

# osu-beatmap-database
Some tools for keeping a local database with all osu! beatmaps + some additional gimmicks (WIP)

### Prerequisites

- MySQL Server (recommendation: https://mariadb.org/)
- A database already set up (I'll call it `$OSU_DB`)
- [node.js](https://nodejs.org/)
- osu! API Key (get one [here](https://old.ppy.sh/p/api))

### Setup

```Bash
git clone https://github.com/LazyLea/osu-beatmap-database.git
npm i
npm -g i pm2 # this might require sudo
cat tables.sql | mysql -u root -p $OSU_DB
```

Now fill in your data in `credentials.json`.

Then start the services which are keeping the database up to date.

```Bash
pm2 start --name event-server event-server.js
pm2 start --name beatmap-update-handler beatmap-update-handler.js
```

### First run

Now you'll get new and updated beatmaps, but we're still missing the beatmaps from before the database was created. For this initial step I wrote a kinda messy script which starts at https://osu.ppy.sh/s/1 and then goes all the way up - which takes an eternity. 

```Bash
pm2 start --name osudb-init init.js
```

Expect this script to run for 1-2 weeks. You can check the current status with `pm2 log osudb-init`.

### Difficulty calculation

TODO

### Beatmap tagging

TODO
