#!/bin/sh
echo "setting up database"
sudo mysql -u root -e "CREATE DATABASE IF NOT EXISTS osu; CREATE USER IF NOT EXISTS 'osudb'@'localhost'; GRANT ALL PRIVILEGES ON osu.* TO 'osudb'@'localhost';"
cat tables.sql | mysql -u osudb osu
echo "cloning osu-difficulty-calculator repository"
mkdir -p ./files
cd ./files
echo "cloning osu-difficulty-calculator repository"
git clone --recurse-submodules https://github.com/ppy/osu-difficulty-calculator
cd ./osu-difficulty-calculator
git pull
echo "restoring dotnet modules"
dotnet restore
echo "building osu-difficulty-calculator"
dotnet build --configuration Release
cd ../..
node init "$(find . -path "./files/osu-difficulty-calculator/osu.Server.DifficultyCalculator/bin/Release/*/osu.Server.DifficultyCalculator.dll" -print -quit)"
echo "done!"
