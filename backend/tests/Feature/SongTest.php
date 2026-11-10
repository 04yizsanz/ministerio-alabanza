<?php

namespace Tests\Feature;

use App\Models\Song;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * SongTest — Pruebas del catálogo de canciones.
 *
 * Verifica CRUD, filtros, paginación y toggle de estado.
 */
class SongTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        // Crear usuario de prueba y autenticarlo para todos los tests de esta clase
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    // ── Listar ────────────────────────────────────────────────────────────────

    public function test_puede_listar_canciones_paginadas(): void
    {
        Song::factory()->count(5)->create();

        $response = $this->getJson('/api/songs');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data', 'current_page', 'total', 'per_page',
                 ]);
    }

    public function test_puede_buscar_canciones_por_titulo(): void
    {
        Song::factory()->create(['title' => 'Sublime Gracia']);
        Song::factory()->create(['title' => 'Océanos']);

        $response = $this->getJson('/api/songs?search=Sublime');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Sublime Gracia', $data[0]['title']);
    }

    public function test_puede_filtrar_canciones_por_tonalidad(): void
    {
        Song::factory()->create(['title' => 'En G', 'original_key' => 'G']);
        Song::factory()->create(['title' => 'En D', 'original_key' => 'D']);

        $response = $this->getJson('/api/songs?key=G');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('G', $data[0]['original_key']);
    }

    public function test_puede_filtrar_canciones_activas_e_inactivas(): void
    {
        Song::factory()->create(['is_active' => true]);
        Song::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/songs?active=true');
        $this->assertCount(1, $response->json('data'));

        $response2 = $this->getJson('/api/songs?active=false');
        $this->assertCount(1, $response2->json('data'));
    }

    // ── Crear ─────────────────────────────────────────────────────────────────

    public function test_puede_crear_una_cancion(): void
    {
        $payload = [
            'title'        => 'Nueva Canción',
            'artist'       => 'Artista Test',
            'original_key' => 'G',
            'bpm'          => 80,
        ];

        $response = $this->postJson('/api/songs', $payload);

        $response->assertStatus(201)
                 ->assertJsonPath('title', 'Nueva Canción')
                 ->assertJsonPath('original_key', 'G');

        $this->assertDatabaseHas('songs', ['title' => 'Nueva Canción']);
    }

    public function test_crear_cancion_sin_titulo_devuelve_error_422(): void
    {
        $response = $this->postJson('/api/songs', ['artist' => 'Sin título']);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['title']);
    }

    public function test_crear_cancion_con_bpm_invalido_devuelve_error(): void
    {
        $response = $this->postJson('/api/songs', [
            'title' => 'Test',
            'bpm'   => 999, // fuera del rango 40-300
        ]);
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['bpm']);
    }

    // ── Ver detalle ────────────────────────────────────────────────────────────

    public function test_puede_ver_detalle_de_una_cancion(): void
    {
        $song = Song::factory()->create();

        $response = $this->getJson("/api/songs/{$song->id}");

        $response->assertStatus(200)
                 ->assertJsonPath('id', $song->id)
                 ->assertJsonPath('title', $song->title);
    }

    public function test_ver_cancion_inexistente_devuelve_404(): void
    {
        $response = $this->getJson('/api/songs/99999');
        $response->assertStatus(404);
    }

    // ── Editar ─────────────────────────────────────────────────────────────────

    public function test_puede_actualizar_una_cancion(): void
    {
        $song = Song::factory()->create(['title' => 'Título original']);

        $response = $this->putJson("/api/songs/{$song->id}", [
            'title' => 'Título actualizado',
        ]);

        $response->assertStatus(200)
                 ->assertJsonPath('title', 'Título actualizado');

        $this->assertDatabaseHas('songs', ['title' => 'Título actualizado']);
    }

    // ── Toggle activo ─────────────────────────────────────────────────────────

    public function test_puede_alternar_estado_activo_de_una_cancion(): void
    {
        $song = Song::factory()->create(['is_active' => true]);

        $response = $this->patchJson("/api/songs/{$song->id}/toggle-active");

        $response->assertStatus(200);
        $this->assertDatabaseHas('songs', ['id' => $song->id, 'is_active' => false]);
    }
}
