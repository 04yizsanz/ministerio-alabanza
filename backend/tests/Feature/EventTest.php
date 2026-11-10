<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\EventType;
use App\Models\MusicalRole;
use App\Models\Person;
use App\Models\ScheduleBlock;
use App\Models\Song;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * EventTest — Pruebas de eventos y programaciones.
 *
 * Verifica el flujo completo: crear evento → agregar bloques
 * → agregar canciones → asignar personas.
 */
class EventTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    // ── Eventos ───────────────────────────────────────────────────────────────

    public function test_puede_listar_eventos(): void
    {
        Event::factory()->count(3)->create();

        $response = $this->getJson('/api/events');

        $response->assertStatus(200)
                 ->assertJsonStructure(['data', 'total']);
    }

    public function test_puede_crear_un_evento(): void
    {
        $type = EventType::factory()->create();

        $response = $this->postJson('/api/events', [
            'event_type_id' => $type->id,
            'name'          => 'Domingo 3 noviembre',
            'start_date'    => '2026-11-03',
            'status'        => 'draft',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('name', 'Domingo 3 noviembre');

        $this->assertDatabaseHas('events', ['name' => 'Domingo 3 noviembre']);
    }

    public function test_crear_evento_sin_nombre_falla(): void
    {
        $type = EventType::factory()->create();

        $response = $this->postJson('/api/events', [
            'event_type_id' => $type->id,
            'start_date'    => '2026-11-03',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name']);
    }

    public function test_destruir_evento_lo_archiva_no_lo_elimina(): void
    {
        $event = Event::factory()->create(['status' => 'published']);

        $this->deleteJson("/api/events/{$event->id}")
             ->assertStatus(200);

        $this->assertDatabaseHas('events', [
            'id'     => $event->id,
            'status' => 'archived',
        ]);
    }

    // ── Bloques ───────────────────────────────────────────────────────────────

    public function test_puede_agregar_un_bloque_a_un_evento(): void
    {
        $event = Event::factory()->create();

        $response = $this->postJson("/api/events/{$event->id}/blocks", [
            'name' => 'Bloque 1',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('name', 'Bloque 1');

        $this->assertDatabaseHas('schedule_blocks', [
            'event_id' => $event->id,
            'name'     => 'Bloque 1',
        ]);
    }

    public function test_puede_listar_bloques_de_un_evento(): void
    {
        $event = Event::factory()->create();
        ScheduleBlock::factory()->count(3)->create(['event_id' => $event->id]);

        $response = $this->getJson("/api/events/{$event->id}/blocks");

        $response->assertStatus(200);
        $this->assertCount(3, $response->json());
    }

    public function test_eliminar_bloque_lo_borra_fisicamente(): void
    {
        $event = Event::factory()->create();
        $block = ScheduleBlock::factory()->create(['event_id' => $event->id]);

        $this->deleteJson("/api/blocks/{$block->id}")
             ->assertStatus(200);

        $this->assertDatabaseMissing('schedule_blocks', ['id' => $block->id]);
    }

    // ── Canciones en bloque ───────────────────────────────────────────────────

    public function test_puede_agregar_cancion_a_bloque(): void
    {
        $event = Event::factory()->create();
        $block = ScheduleBlock::factory()->create(['event_id' => $event->id]);
        $song  = Song::factory()->create();

        $response = $this->postJson("/api/blocks/{$block->id}/songs", [
            'song_id'  => $song->id,
            'key_used' => 'G',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('key_used', 'G');

        $this->assertDatabaseHas('block_songs', [
            'schedule_block_id' => $block->id,
            'song_id'           => $song->id,
            'key_used'          => 'G',
        ]);
    }

    public function test_cambiar_tonalidad_en_bloque_no_afecta_cancion_original(): void
    {
        $event = Event::factory()->create();
        $block = ScheduleBlock::factory()->create(['event_id' => $event->id]);
        $song  = Song::factory()->create(['original_key' => 'C']);

        // Agregar al bloque en tonalidad diferente
        $this->postJson("/api/blocks/{$block->id}/songs", [
            'song_id'  => $song->id,
            'key_used' => 'G',
        ]);

        // La canción original sigue en C
        $this->assertDatabaseHas('songs', [
            'id'           => $song->id,
            'original_key' => 'C',
        ]);
    }

    public function test_puede_quitar_cancion_de_bloque(): void
    {
        $event   = Event::factory()->create();
        $block   = ScheduleBlock::factory()->create(['event_id' => $event->id]);
        $song    = Song::factory()->create();

        $addResponse = $this->postJson("/api/blocks/{$block->id}/songs", [
            'song_id' => $song->id,
        ]);
        $blockSongId = $addResponse->json('id');

        $this->deleteJson("/api/block-songs/{$blockSongId}")
             ->assertStatus(200);

        $this->assertDatabaseMissing('block_songs', ['id' => $blockSongId]);
    }

    // ── Asignaciones de personas ──────────────────────────────────────────────

    public function test_puede_asignar_equipo_a_bloque_con_bulk(): void
    {
        $event  = Event::factory()->create();
        $block  = ScheduleBlock::factory()->create(['event_id' => $event->id]);
        $role   = MusicalRole::factory()->create();
        $person = Person::factory()->create();

        $response = $this->postJson("/api/blocks/{$block->id}/assignments/bulk", [
            'assignments' => [
                ['musical_role_id' => $role->id, 'person_id' => $person->id],
            ],
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('block_assignments', [
            'schedule_block_id' => $block->id,
            'musical_role_id'   => $role->id,
            'person_id'         => $person->id,
        ]);
    }

    public function test_bulk_assignments_reemplaza_asignaciones_previas(): void
    {
        $event   = Event::factory()->create();
        $block   = ScheduleBlock::factory()->create(['event_id' => $event->id]);
        $role    = MusicalRole::factory()->create();
        $person1 = Person::factory()->create();
        $person2 = Person::factory()->create();

        // Primera asignación
        $this->postJson("/api/blocks/{$block->id}/assignments/bulk", [
            'assignments' => [
                ['musical_role_id' => $role->id, 'person_id' => $person1->id],
            ],
        ]);

        // Segunda asignación — reemplaza la primera
        $this->postJson("/api/blocks/{$block->id}/assignments/bulk", [
            'assignments' => [
                ['musical_role_id' => $role->id, 'person_id' => $person2->id],
            ],
        ]);

        // Solo debe existir la segunda
        $this->assertDatabaseMissing('block_assignments', [
            'schedule_block_id' => $block->id,
            'person_id'         => $person1->id,
        ]);
        $this->assertDatabaseHas('block_assignments', [
            'schedule_block_id' => $block->id,
            'person_id'         => $person2->id,
        ]);
    }

    // ── Duplicar bloque ───────────────────────────────────────────────────────

    public function test_puede_duplicar_bloque_con_canciones(): void
    {
        $event = Event::factory()->create();
        $block = ScheduleBlock::factory()->create(['event_id' => $event->id, 'name' => 'Original']);
        $song  = Song::factory()->create();

        $this->postJson("/api/blocks/{$block->id}/songs", ['song_id' => $song->id, 'key_used' => 'Am']);

        $response = $this->postJson("/api/blocks/{$block->id}/duplicate");

        $response->assertStatus(201)
                 ->assertJsonPath('name', 'Original (copia)');

        // El evento ahora tiene 2 bloques
        $this->assertDatabaseCount('schedule_blocks', 2);
        // La copia también tiene la canción
        $newBlockId = $response->json('id');
        $this->assertDatabaseHas('block_songs', [
            'schedule_block_id' => $newBlockId,
            'song_id'           => $song->id,
            'key_used'          => 'Am',
        ]);
    }
}
