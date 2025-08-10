const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Your existing players data
const PLAYERS_TO_IMPORT = {
    'Lou Amundson': {
        keyWord: 'Almond',
        teams: ['PHO', 'NYK', 'NOP', 'PHI', 'CHI', 'IND', 'GSW', 'MIN', 'CLE', 'UTA'],
        story: 'The (PHO) Sun shot a giant almond out, and it landed on the (NYK) statue of liberty. The statue of liberty held up the giant almond instead of the torch, but then a giant (NOP) pelican grabbed it and flew away. The pelican dropped the almond onto the (PHI) liberty bell, and the almond bounced off and landed on the horn of a (CHI) bull. The bull started racing away, and ran so fast that it turned into an almond race car at the (IND) Indianapolis 500. The almond car was driving so fast that it hit a ramp and flew all the way to the (GSW) Golden Gate Bridge, where it crashed. An enormous (MIN) wolf ate up all the shattered almond pieces, then was full so had to call a (CLE) cab to drive him away. When he got into the cab, it was filled with (UTA) jazz instruments, like tubas and saxophones.'
    },
    
    'Ish Smith': {
        keyWord: 'Fish',
        teams: ['DET', 'WAS', 'CHA', 'PHI', 'ORL', 'PHO', 'DEN', 'OKC', 'HOU', 'NOP', 'MIL', 'MEM', 'GSW'],
        story: 'A (DET) assembly line was making fish. Many of the fish were used to coat the (WAS) Washington Monument. But (CHA) hornets kept eating the fish, and some hornets grabbed the fish and dropped it onto the (PHI) liberty bell. Rocky Balboa saw that and didn\'t like it, so he used an (ORL) magic wand to turn the fish into so a million fish-shaped (PHO) Suns. The sun-fish fell down to the (DEN) rocky mountains, which triggered a fish (OKC) thunderstorm. To intercept the fish, NASA sent up a fish-shaped (HOU) rocket and the EPA sent up a horde of (NOP) Pelicans. Below, on Bourbon Street, people began to throw the fish around like (MIL) bucks, like one-dollar bills. A (MEM) grizzly bear saw all the fish and ate them all! But he was still hungry, so he sat on the (GSW) Golden Gate Bridge and went fishing.'
    },
    
    'Jeff Green': {
        keyWord: 'Jolly Green Giant',
        teams: ['OKC', 'BOS', 'MEM', 'LAC', 'WAS', 'UTA', 'HOU', 'BKN', 'DEN'],
        story: 'A long time ago, the Jolly Green Giant created a massive (OKC) thunderstorm, and instead of hail, tons of cans of Jolly Green Giant vegetables came hurtling down from the sky! All these cans fused together and formed the towering Green Monster wall at (BOS) Fenway Park. But then a massive (MEM) grizzly bear crashed into the wall, exploding it into a single enormous Jolly Green Giant vegetable can. The can was drawn by a powerful magnet onto the Jolly Green Giant (LAC) clipper ship which had been parked in Boston Harbor to gather cans from the storm. The Jolly Green Giant saw the giant can land on the magnet, and he was hungry but had no way to open the giant can, so he reached out a giant hand and grabbed the (WAS) Washington Monument as a can opener. The monument scraping against the cans sounded like loud (UTA) Jazz music. It was so loud that everyone in the country could hear it, and so NASA lit a (HOU) rocket under the Giant to launch him into outer space! But as he exited Earth atmosphere, the Green Giant rocket was captured by an enormous (BKN) net by an enormous intergalactic baby. He bent the rocket into the shape of a chicken (DEN) nugget and ate it.'
    },
    
    'Chucky Brown': {
        keyWord: 'Chucky Doll',
        teams: ['CLE', 'LAL', 'BKN', 'DAL', 'HOU', 'PHO', 'MIL', 'ATL', 'CHA', 'SAS', 'GSW', 'SAC'],
        story: 'Chucky murders a (CLE) taxi driver and steals his cab, but crashes and flies through the windshield into a (LAL) lake. Underwater, he gets tangled in a (BKN) fishing net and kicks through it with his white (DAL) cowboy boot to escape. He climbs onto a (HOU) rocket ship that looks just like another Chucky doll, but crashes the rocket directly into the (PHO) sun. The intense heat melts Chucky, and a magical (MIL) mint turns his melted remains into dollar bills. Each bill has Chucky\'s face on one side and a screeching (ATL) hawk on the other. A swarm of angry (CHA) hornets attacks the hawk image, thinking it\'s a real bird, but a giant Chucky kicks them away with the sharp (SAS) spur on his boot. The spilled blood turns golden in the sunlight and flows down to form the (GSW) Golden Gate Bridge. The (SAC) King of the land is so impressed with this bridge that he crowns Chucky as the new ruler.'
    },
    
    'Hassan Whiteside': {
        keyWord: 'White Eyes',
        teams: ['SAC', 'MIA', 'POR', 'UTA'],
        story: 'A (SAC) king wearing a crown made of white eyeballs generates intense (MIA) heat from his white eyes, (POR) blazing a trail through the woods to the enemy camp. When the trees all disintegrate, all that is left is a band of musicians playing (UTA) jazz instruments that have white eyes shooting out of them along with music.'
    },
    
    'Earl Boykins': {
        keyWord: 'Sea Queen & Pearls',
        teams: ['BKN', 'CLE', 'ORL', 'LAC', 'GSW', 'DEN', 'MIL', 'CHA', 'WAS', 'HOU'],
        story: 'A sea queen gathers a million pearls into a (BKN) net, and tosses the pearls onto the roof of a (CLE) taxi cab, enveloping the cab. Using a blue (ORL) magic wand made of pearls, the queen transforms the pearl-laden cab into a boat laden and overflowing with pearls. The ship with pearls sails under the (LAC) golden gate bridge, but they collide with the bridge and fly to the (GSW) rocky mountains, coating the ice-capped mountains with pearls. (DEN) Deers there place the pearls all over their marvelous antlers, but a horde of (MIL) bucks attacks the deer to steal the pearls. The bucks carry the melted pearls to a horde of (CHA) hornets who place a giant PEARL on top of the (WAS) Washington Monument. The magic pearl transforms the monument into a (HOU) rocket and it flies into space.'
    },
    
    'Garrett Temple': {
        keyWord: 'Temple',
        teams: ['HOU', 'SAC', 'SAS', 'MIL', 'CHA', 'WAS', 'MEM', 'LAC', 'BKN', 'CHI', 'NOP', 'TOR'],
        story: 'A garnet temple is erected on top of a (HOU) rocket ship. A (SAC) king sits on a throne inside the temple. The flying temple is speared out of the sky by an enormous (SAS) cowboy spur. The giant cowboy pours (MIL) milk all over the temple. A horde of (CHA) hornets are attracted to the milk on the temple. As they drink the milk, the (WAS) Washington Monument is tossed like a javelin and spears through the hornets into the temple. A (MEM) grizzly bear climbs up the Monument sticking straight up in the sky, using it as a mast; he adds a sail to convert the temple into a (LAC) clipper ship. The bear pilots the temple/ship to Spain where it\'s caught by a (BKN) net. It lands in Spain, and the running bulls of pamplona crowd into the temple\'s pews for prayer. When they enter the temple, they are transformed into (CHI) bull creatures with (NOP) pelican beaks and (TOR) velociraptor bodies.'
    },
    
    'Rod Strickland': {
        keyWord: 'Lightning Bolt',
        teams: ['NYK', 'SAS', 'POR', 'WAS', 'MIA', 'MIN', 'ORL', 'TOR', 'HOU'],
        story: 'The (NYK) Statue of Liberty shoots lightning bolts down into the (SAS) spurs of a herd of cowboys galloping through the woods below. The lightning causes the spurs to catch fire and blaze a (POR) trail through the dense forest. As the cowboys ride deeper into the woods, they discover that all the trees are shaped like (WAS) Washington Monuments, with lightning crackling and shooting from their pointed tips. The red-hot lightning from the monument-trees sizzles through the air, generating intense (MIA) heat that incinerates a pack of (MIN) wolves running through the forest. The lead wolf holds a glowing (ORL) magic wand and shoots a brilliant lightning bolt at another wolf, instantly transforming it into a (TOR) raptor with a (HOU) rocket for a tail. The rocket has lightning bolts for fins.'
    },
    
    'D.J. Augustin': {
        keyWord: 'Hornet DJ on headphone-shaped racetrack in the Rockies',
        teams: ['CHA', 'IND', 'TOR', 'CHI', 'DET', 'OKC', 'DEN', 'ORL', 'MIL', 'HOU', 'LAL'],
        story: 'A giant (CHA) hornet is DJing in the middle of the (IND) Indianapolis 500 racetrack, which is shaped like a giant pair of headphones. Instead of race cars, (TOR) velociraptors and (CHI) bulls are racing. The bulls and raptors keep running off the end, so a (DET) assembly line churns more out. It starts (OKC) raining headphones on the event, which is taking place in the (DEN) Rocky Mountains. The DJ hornet takes a (ORL) magic wand and turns all the headphones into (MIL) money. Then the DJ hornet hops onto a (HOU) rocket to fly away, but he crashes into a (LAL) lake.'
    }
};

// Connect to database
const db = new sqlite3.Database('./data/players.db');

console.log('Starting import of players...\n');

let successCount = 0;
let errorCount = 0;
let skipCount = 0;

// Import each player
const playerNames = Object.keys(PLAYERS_TO_IMPORT);
let currentIndex = 0;

function importNextPlayer() {
    if (currentIndex >= playerNames.length) {
        // All done
        console.log('\n========================================');
        console.log('Import Complete!');
        console.log(`✅ Successfully imported: ${successCount} players`);
        console.log(`⚠️  Skipped (already exists): ${skipCount} players`);
        console.log(`❌ Errors: ${errorCount} players`);
        console.log('========================================\n');
        db.close();
        return;
    }
    
    const name = playerNames[currentIndex];
    const player = PLAYERS_TO_IMPORT[name];
    currentIndex++;
    
    // Check if player already exists
    db.get("SELECT name FROM players WHERE name = ?", [name], (err, row) => {
        if (err) {
            console.error(`❌ Error checking ${name}:`, err.message);
            errorCount++;
            importNextPlayer();
            return;
        }
        
        if (row) {
            console.log(`⚠️  Skipping ${name} - already exists`);
            skipCount++;
            importNextPlayer();
            return;
        }
        
        // Insert the player
        db.run(
            `INSERT INTO players (name, keyWord, teams, story) VALUES (?, ?, ?, ?)`,
            [name, player.keyWord, JSON.stringify(player.teams), player.story],
            (err) => {
                if (err) {
                    console.error(`❌ Error importing ${name}:`, err.message);
                    errorCount++;
                } else {
                    console.log(`✅ Imported ${name} - ${player.teams.length} teams`);
                    successCount++;
                }
                importNextPlayer();
            }
        );
    });
}

// Start the import
importNextPlayer();