<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MusicalRoleSeeder extends Seeder
{
    public function run(): void
    {
        // category: 'music' = funciones musicales/vocales
        //           'tech'  = funciones técnicas (sonido, transmisión)
        //           'service' = funciones de servicio (escenario, danza, etc.)
        $roles = [
            // Vocales
            ['name' => 'Dirección de alabanza', 'category' => 'music',   'sort_order' => 1],
            ['name' => 'Cantante',              'category' => 'music',   'sort_order' => 2],
            ['name' => 'Coro de apoyo',         'category' => 'music',   'sort_order' => 3],
            ['name' => 'Talkback',              'category' => 'music',   'sort_order' => 4],
            // Instrumentos
            ['name' => 'Teclados',              'category' => 'music',   'sort_order' => 5],
            ['name' => 'Bajo',                  'category' => 'music',   'sort_order' => 6],
            ['name' => 'Batería',               'category' => 'music',   'sort_order' => 7],
            ['name' => 'Cajón peruano',         'category' => 'music',   'sort_order' => 8],
            ['name' => 'Guitarra acústica',     'category' => 'music',   'sort_order' => 9],
            ['name' => 'Guitarra eléctrica',    'category' => 'music',   'sort_order' => 10],
            // Técnica
            ['name' => 'Sonido',                'category' => 'tech',    'sort_order' => 11],
            ['name' => 'Sonido streaming',      'category' => 'tech',    'sort_order' => 12],
            ['name' => 'Computador ProPresenter','category' => 'tech',   'sort_order' => 13],
            ['name' => 'Computador transmisión','category' => 'tech',    'sort_order' => 14],
            // Servicio
            ['name' => 'Encargado de turno',    'category' => 'service', 'sort_order' => 15],
            ['name' => 'Servidor',              'category' => 'service', 'sort_order' => 16],
            ['name' => 'Escenario',             'category' => 'service', 'sort_order' => 17],
            ['name' => 'Danza',                 'category' => 'service', 'sort_order' => 18],
        ];

        foreach ($roles as $role) {
            DB::table('musical_roles')->updateOrInsert(
                ['name' => $role['name']],
                array_merge($role, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }

        $this->command->info('Funciones musicales creadas: ' . count($roles));
    }
}
