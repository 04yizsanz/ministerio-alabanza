<?php

namespace Database\Seeders;

use App\Models\Song;
use Illuminate\Database\Seeder;

/**
 * SongSeeder — Canciones de muestra para desarrollo y pruebas.
 *
 * Ejecutar con:
 *   php artisan db:seed --class=SongSeeder
 *
 * O junto con todo el sistema:
 *   php artisan db:seed
 */
class SongSeeder extends Seeder
{
    public function run(): void
    {
        $songs = [
            // Canciones de alabanza y adoración populares (tonalidades reales)
            ['title' => 'Sublime Gracia',          'artist' => 'Tradicional',         'original_key' => 'G',  'bpm' => 72,  'notes' => 'Clásico de adoración profunda'],
            ['title' => 'Cuán grande es Él',        'artist' => 'Tradicional',         'original_key' => 'A',  'bpm' => 68,  'notes' => null],
            ['title' => 'Tu Fidelidad',             'artist' => 'Marcos Witt',         'original_key' => 'D',  'bpm' => 78,  'notes' => 'Inicio suave, crescendo en el coro'],
            ['title' => 'Dios de Pactos',           'artist' => 'Gateway Worship',     'original_key' => 'C',  'bpm' => 64,  'notes' => null],
            ['title' => 'Soy Libre',                'artist' => 'Hillsong Worship',    'original_key' => 'E',  'bpm' => 76,  'notes' => null],
            ['title' => 'Océanos',                  'artist' => 'Hillsong United',     'original_key' => 'Bb', 'bpm' => 68,  'notes' => 'Versión en español'],
            ['title' => 'Maravilloso',              'artist' => 'Phil Wickham',         'original_key' => 'G',  'bpm' => 82,  'notes' => null],
            ['title' => 'Reckless Love',            'artist' => 'Cory Asbury',         'original_key' => 'A',  'bpm' => 70,  'notes' => 'Amor Incondicional — versión español'],
            ['title' => 'Goodness of God',          'artist' => 'Bethel Music',        'original_key' => 'D',  'bpm' => 66,  'notes' => 'La Bondad de Dios'],
            ['title' => 'Way Maker',                'artist' => 'Sinach',              'original_key' => 'C',  'bpm' => 84,  'notes' => 'Hacedor de Camino'],
            ['title' => 'Abre Mis Ojos',            'artist' => 'Marcos Witt',         'original_key' => 'F',  'bpm' => 74,  'notes' => null],
            ['title' => 'Poderoso para Salvar',     'artist' => 'Hillsong',            'original_key' => 'G',  'bpm' => 76,  'notes' => 'Mighty to Save en español'],
            ['title' => 'Esto es lo que Hiciste',   'artist' => 'Generación 12',       'original_key' => 'E',  'bpm' => 90,  'notes' => null],
            ['title' => 'Al que está Sentado',      'artist' => 'Marcos Barrientos',   'original_key' => 'A',  'bpm' => 70,  'notes' => null],
            ['title' => 'Tu Gloria en este lugar',  'artist' => 'Generación 12',       'original_key' => 'D',  'bpm' => 68,  'notes' => 'Para tiempos de presencia'],
            ['title' => 'Agnus Dei',                'artist' => 'Michael W. Smith',    'original_key' => 'Bb', 'bpm' => 62,  'notes' => 'Cordero de Dios'],
            ['title' => 'Espíritu Santo',           'artist' => 'Jesus Culture',       'original_key' => 'G',  'bpm' => 76,  'notes' => 'Holy Spirit'],
            ['title' => 'Canción del Señor',        'artist' => 'Marcos Witt',         'original_key' => 'C',  'bpm' => 80,  'notes' => null],
            ['title' => 'Gloria in Excelsis Deo',   'artist' => 'Tradicional Navidad', 'original_key' => 'F',  'bpm' => 88,  'notes' => 'Para eventos especiales de navidad'],
            ['title' => 'Viviente',                 'artist' => 'Hillsong en Español', 'original_key' => 'E',  'bpm' => 86,  'notes' => 'Alive — versión español'],
        ];

        foreach ($songs as $song) {
            Song::updateOrCreate(
                ['title' => $song['title']],          // evitar duplicados
                array_merge($song, ['is_active' => true])
            );
        }

        $this->command->info('Canciones de muestra creadas: ' . count($songs));
    }
}
