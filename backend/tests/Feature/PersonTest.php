<?php

namespace Tests\Feature;

use App\Models\MusicalRole;
use App\Models\Person;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * PersonTest — Pruebas del directorio de integrantes.
 */
class PersonTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    public function test_puede_listar_personas(): void
    {
        Person::factory()->count(3)->create();

        $response = $this->getJson('/api/people');

        $response->assertStatus(200)
                 ->assertJsonStructure(['data', 'total']);
    }

    public function test_puede_obtener_lista_completa_sin_paginar(): void
    {
        Person::factory()->count(5)->create(['is_active' => true]);

        $response = $this->getJson('/api/people/all');

        $response->assertStatus(200);
        $this->assertCount(5, $response->json());
    }

    public function test_people_all_solo_devuelve_activos(): void
    {
        Person::factory()->count(3)->create(['is_active' => true]);
        Person::factory()->count(2)->create(['is_active' => false]);

        $response = $this->getJson('/api/people/all');

        // Solo los 3 activos
        $this->assertCount(3, $response->json());
    }

    public function test_puede_crear_persona_con_roles(): void
    {
        $role1 = MusicalRole::factory()->create(['name' => 'Cantante']);
        $role2 = MusicalRole::factory()->create(['name' => 'Teclados']);

        $payload = [
            'first_name'       => 'María',
            'last_name'        => 'González',
            'musical_role_ids' => [$role1->id, $role2->id],
        ];

        $response = $this->postJson('/api/people', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('first_name', 'María');

        $person = Person::where('first_name', 'María')->first();
        $this->assertCount(2, $person->musicalRoles);
    }

    public function test_crear_persona_sin_nombre_devuelve_error(): void
    {
        $response = $this->postJson('/api/people', ['last_name' => 'Test']);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['first_name']);
    }

    public function test_puede_actualizar_persona(): void
    {
        $person = Person::factory()->create(['first_name' => 'Juan']);

        $response = $this->putJson("/api/people/{$person->id}", [
            'first_name' => 'Carlos',
            'last_name'  => $person->last_name,
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('first_name', 'Carlos');
    }

    public function test_eliminar_persona_la_desactiva_no_la_borra(): void
    {
        $person = Person::factory()->create(['is_active' => true]);

        $response = $this->deleteJson("/api/people/{$person->id}");

        $response->assertStatus(200);

        // El registro sigue en la BD pero inactivo
        $this->assertDatabaseHas('people', [
            'id'        => $person->id,
            'is_active' => false,
        ]);
    }

    public function test_no_se_puede_crear_persona_con_email_duplicado(): void
    {
        Person::factory()->create(['email' => 'repetido@test.com']);

        $response = $this->postJson('/api/people', [
            'first_name' => 'Otro',
            'last_name'  => 'Nombre',
            'email'      => 'repetido@test.com',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }
}
