<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Crea la cuenta de la líder del ministerio.
     * Usar updateOrCreate evita duplicados si el seeder se ejecuta varias veces.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'lider@ministerio.local'],
            [
                'name'              => 'Líder del Ministerio',
                'password'          => Hash::make('ministerio123'),
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Usuario administrador creado: lider@ministerio.local / ministerio123');
    }
}
