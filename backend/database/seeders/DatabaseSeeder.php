<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            EventTypeSeeder::class,
            MusicalRoleSeeder::class,
            // SongSeeder::class,      // se agregará después con canciones de prueba
            // PersonSeeder::class,    // se agregará después con integrantes de prueba
        ]);
    }
}
