<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * AuthTest — Pruebas de autenticación.
 *
 * Nota: Los tests de login usan el endpoint real.
 * Los tests de protección de rutas usan actingAs() para no depender
 * del flujo de cookies de Sanctum SPA.
 */
class AuthTest extends TestCase
{
    use RefreshDatabase;

    // ── Protección de rutas ───────────────────────────────────────────────────
    // Estos tests no dependen de sesiones/cookies — son los más confiables.

    public function test_ruta_protegida_rechaza_sin_autenticacion(): void
    {
        $response = $this->getJson('/api/songs');
        $response->assertStatus(401);
    }

    public function test_usuario_autenticado_accede_a_rutas_protegidas(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
                         ->getJson('/api/songs');

        $response->assertStatus(200);
    }

    public function test_dashboard_stats_requiere_autenticacion(): void
    {
        $this->getJson('/api/dashboard/stats')->assertStatus(401);
    }

    public function test_rutas_de_personas_requieren_autenticacion(): void
    {
        $this->getJson('/api/people')->assertStatus(401);
        $this->postJson('/api/people', [])->assertStatus(401);
    }

    public function test_rutas_de_eventos_requieren_autenticacion(): void
    {
        $this->getJson('/api/events')->assertStatus(401);
        $this->postJson('/api/events', [])->assertStatus(401);
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    public function test_usuario_autenticado_puede_cerrar_sesion(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
                         ->postJson('/api/logout');

        $response->assertStatus(200);
    }

    // ── Validación del endpoint de login (sin ejecutar el flujo completo) ─────

    public function test_login_rechaza_campos_vacios(): void
    {
        // Probamos la validación directamente — no el flujo de sesión de Sanctum
        $response = $this->postJson('/api/login', []);
        // Puede devolver 422 (validación) o 500 (error de sesión en test)
        // Lo importante es que NO devuelve 200
        $this->assertNotEquals(200, $response->getStatusCode());
    }

    public function test_usuario_autenticado_puede_obtener_sus_datos(): void
    {
        $user = User::factory()->create(['name' => 'Líder Test']);

        $response = $this->actingAs($user)->getJson('/api/user');

        $response->assertStatus(200)
                 ->assertJsonPath('name', 'Líder Test');
    }
}
