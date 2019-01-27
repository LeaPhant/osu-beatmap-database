/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for table osu.beatmap
CREATE TABLE IF NOT EXISTS `beatmap` (
  `beatmap_id` int(11) NOT NULL,
  `beatmapset_id` int(11) DEFAULT NULL,
  `approved` tinyint(4) DEFAULT NULL,
  `total_length` int(11) DEFAULT NULL,
  `hit_length` int(11) DEFAULT NULL,
  `version` text CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `artist` text CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `title` text CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `creator` text CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `creator_id` int(11) DEFAULT NULL,
  `mode` tinyint(4) DEFAULT NULL,
  `cs` float DEFAULT NULL,
  `od` float DEFAULT NULL,
  `ar` float DEFAULT NULL,
  `hp` float DEFAULT NULL,
  `approved_date` date DEFAULT NULL,
  `last_updated_date` date DEFAULT NULL,
  `bpm` int(11) DEFAULT NULL,
  `bpm_min` int(11) DEFAULT NULL,
  `bpm_max` int(11) DEFAULT NULL,
  `source` text CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `tags` text CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `genre_id` tinyint(4) DEFAULT NULL,
  `language_id` tinyint(4) DEFAULT NULL,
  `max_combo` int(11) DEFAULT NULL,
  `star_rating` double DEFAULT NULL,
  `star_rating_aim` double DEFAULT NULL,
  `star_rating_speed` double DEFAULT NULL,
  `hit_objects` int(11) DEFAULT NULL,
  `num_circles` int(11) DEFAULT NULL,
  `num_sliders` int(11) DEFAULT NULL,
  `num_spinners` int(11) DEFAULT NULL,
  `favorites` int(11) DEFAULT NULL,
  `plays` int(11) DEFAULT NULL,
  `passes` int(11) DEFAULT NULL,
  `recalculate` tinyint(4) DEFAULT 1,
  PRIMARY KEY (`beatmap_id`),
  KEY `mode` (`mode`),
  KEY `Approved` (`approved`),
  KEY `beatmapset_id` (`beatmapset_id`),
  FULLTEXT KEY `Text` (`version`,`artist`,`title`,`creator`,`source`,`tags`),
  FULLTEXT KEY `Version` (`version`),
  FULLTEXT KEY `Artist` (`artist`),
  FULLTEXT KEY `Title` (`title`),
  FULLTEXT KEY `Creator` (`creator`),
  FULLTEXT KEY `Source` (`source`),
  FULLTEXT KEY `Tags` (`tags`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- Data exporting was unselected.
-- Dumping structure for table osu.difficulty
CREATE TABLE IF NOT EXISTS `difficulty` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `beatmap_id` int(11) DEFAULT NULL,
  `mods` int(11) DEFAULT 0,
  `mode` tinyint(4) DEFAULT 0,
  `type` tinyint(4) DEFAULT NULL,
  `value` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mode` (`mode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- Data exporting was unselected.
-- Dumping structure for table osu.difficulty_type
CREATE TABLE IF NOT EXISTS `difficulty_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- Data exporting was unselected.
-- Dumping structure for table osu.tag
CREATE TABLE IF NOT EXISTS `tag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `beatmap_id` int(11) NOT NULL DEFAULT 0,
  `mode` int(11) NOT NULL DEFAULT 0,
  `type` int(11) NOT NULL DEFAULT 0,
  `value` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- Data exporting was unselected.
-- Dumping structure for table osu.tag_type
CREATE TABLE IF NOT EXISTS `tag_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` tinytext COLLATE utf8_bin NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
