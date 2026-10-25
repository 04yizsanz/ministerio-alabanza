<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Song;

class SongSeeder extends Seeder
{
    public function run(): void
    {
        $songs = [
            ['title' => 'Santo',                     'artist' => 'Elevation Worship', 'original_key' => 'G',  'bpm' => 72],
            ['title' => 'Goodness of God',            'artist' => 'Bethel Music',      'original_key' => 'A',  'bpm' => 68],
            ['title' => 'Reckless Love',              'artist' => 'Cory Asbury',       'original_key' => 'G',  'bpm' => 70],
            ['title' => 'Way Maker',                  'artist' => 'Sinach',            'original_key' => 'Bb', 'bpm' => 67],
            ['title' => 'What a Beautiful Name',      'artist' => 'Hillsong Worship',  'original_key' => 'D',  'bpm' => 68],
            ['title' => 'Oceans',                     'artist' => 'Hillsong United',   'original_key' => 'D',  'bpm' => 70],
            ['title' => 'Aún hay Dios',               'artist' => 'Marcos Witt',       'original_key' => 'E',  'bpm' => 80],
            ['title' => 'Grande y Fuerte',            'artist' => 'Generación 12',     'original_key' => 'C',  'bpm' => 85],
            ['title' => 'Majestuoso',                 'artist' => 'Marco Barrientos',  'original_key' => 'F',  'bpm' => 75],
            ['title' => 'Sublime Gracia',             'artist' => 'Tradicional',       'original_key' => 'G',  'bpm' => 72],
        ];

        foreach ($songs as $song) {
            Song::updateOrCreate(
                ['title' => $song['title'], 'artist' => $song['artist']],
                array_merge($song, ['is_active' => true])
            );
        }

        $this->command->info('Canciones de prueba creadas: ' . count($songs));
    }
}
