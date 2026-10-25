<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Domingo',          'slug' => 'domingo',          'color' => '#e8003a'],
            ['name' => 'CDO',              'slug' => 'cdo',              'color' => '#7c3aed'],
            ['name' => 'Blaze',            'slug' => 'blaze',            'color' => '#ea580c'],
            ['name' => 'Campamento',       'slug' => 'campamento',       'color' => '#16a34a'],
            ['name' => 'Alborada',         'slug' => 'alborada',         'color' => '#ca8a04'],
            ['name' => 'Ensayo',           'slug' => 'ensayo',           'color' => '#0284c7'],
            ['name' => 'Evento especial',  'slug' => 'evento-especial',  'color' => '#db2777'],
            ['name' => 'Otro',             'slug' => 'otro',             'color' => '#6b7280'],
        ];

        foreach ($types as $type) {
            DB::table('event_types')->updateOrInsert(
                ['slug' => $type['slug']],
                array_merge($type, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }

        $this->command->info('Tipos de evento creados: ' . count($types));
    }
}
