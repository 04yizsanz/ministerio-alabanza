<?php

namespace Database\Seeders;

use App\Models\MusicalRole;
use App\Models\Person;
use Illuminate\Database\Seeder;

/**
 * PersonSeeder — Integrantes de muestra con funciones asignadas.
 *
 * Ejecutar con:
 *   php artisan db:seed --class=PersonSeeder
 */
class PersonSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener los roles por nombre para asignarlos dinámicamente
        $roles = MusicalRole::pluck('id', 'name');

        $people = [
            [
                'first_name' => 'María',
                'last_name'  => 'González',
                'roles'      => ['Dirección de alabanza', 'Cantante'],
            ],
            [
                'first_name' => 'Ana',
                'last_name'  => 'Martínez',
                'roles'      => ['Cantante', 'Coro de apoyo'],
            ],
            [
                'first_name' => 'Carlos',
                'last_name'  => 'López',
                'roles'      => ['Teclados'],
            ],
            [
                'first_name' => 'Pedro',
                'last_name'  => 'Ramírez',
                'roles'      => ['Bajo'],
            ],
            [
                'first_name' => 'Luis',
                'last_name'  => 'Torres',
                'roles'      => ['Batería', 'Cajón peruano'],
            ],
            [
                'first_name' => 'Sofía',
                'last_name'  => 'Herrera',
                'roles'      => ['Guitarra acústica', 'Cantante'],
            ],
            [
                'first_name' => 'Andrés',
                'last_name'  => 'Castro',
                'roles'      => ['Guitarra eléctrica'],
            ],
            [
                'first_name' => 'Laura',
                'last_name'  => 'Vargas',
                'roles'      => ['Coro de apoyo', 'Talkback'],
            ],
            [
                'first_name' => 'Juan',
                'last_name'  => 'Morales',
                'roles'      => ['Sonido'],
            ],
            [
                'first_name' => 'Valentina',
                'last_name'  => 'Ríos',
                'roles'      => ['Computador y ProPresenter'],
            ],
            [
                'first_name' => 'Santiago',
                'last_name'  => 'Flores',
                'roles'      => ['Sonido de streaming', 'Computador de transmisión'],
            ],
            [
                'first_name' => 'Camila',
                'last_name'  => 'Díaz',
                'roles'      => ['Danza'],
            ],
        ];

        foreach ($people as $data) {
            $person = Person::updateOrCreate(
                ['first_name' => $data['first_name'], 'last_name' => $data['last_name']],
                ['is_active' => true]
            );

            // Asignar roles existentes (ignorar los que no existan en la BD)
            $roleIds = collect($data['roles'])
                ->filter(fn($r) => $roles->has($r))
                ->map(fn($r) => $roles[$r])
                ->values()
                ->all();

            if (!empty($roleIds)) {
                $person->musicalRoles()->sync($roleIds);
            }
        }

        $this->command->info('Integrantes de muestra creados: ' . count($people));
    }
}
