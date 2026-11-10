<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\SongController;
use App\Http\Controllers\Api\CipherTextController;
use App\Http\Controllers\Api\CipherFileController;
use App\Http\Controllers\Api\PersonController;
use App\Http\Controllers\Api\MusicalRoleController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ScheduleBlockController;
use App\Http\Controllers\Api\ExportController;

// ── Rutas públicas ──────────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);

// ── Rutas protegidas ────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user',    fn(Request $r) => $r->user());
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // ── Canciones ──────────────────────────────────────────────────────
    Route::apiResource('songs', SongController::class);
    Route::patch('songs/{song}/toggle-active', [SongController::class, 'toggleActive']);

    Route::get('songs/{song}/cipher-texts',        [CipherTextController::class, 'index']);
    Route::post('songs/{song}/cipher-texts',       [CipherTextController::class, 'store']);
    Route::put('cipher-texts/{cipherText}',        [CipherTextController::class, 'update']);
    Route::delete('cipher-texts/{cipherText}',     [CipherTextController::class, 'destroy']);

    Route::get('songs/{song}/cipher-files',              [CipherFileController::class, 'index']);
    Route::post('songs/{song}/cipher-files',             [CipherFileController::class, 'store']);
    Route::get('cipher-files/{cipherFile}/download',     [CipherFileController::class, 'download']);
    Route::delete('cipher-files/{cipherFile}',           [CipherFileController::class, 'destroy']);

    // ── Personas ───────────────────────────────────────────────────────
    Route::get('people/all', [PersonController::class, 'all']);
    Route::apiResource('people', PersonController::class);

    // ── Funciones musicales ────────────────────────────────────────────
    Route::apiResource('musical-roles', MusicalRoleController::class)->except(['show']);

    // ── Tipos de evento ────────────────────────────────────────────────
    Route::get('event-types', [EventController::class, 'types']);

    // ── Eventos ────────────────────────────────────────────────────────
    Route::apiResource('events', EventController::class);

    // ── Bloques de programación ────────────────────────────────────────
    Route::get('events/{event}/blocks',  [ScheduleBlockController::class, 'index']);
    Route::post('events/{event}/blocks', [ScheduleBlockController::class, 'store']);
    Route::put('blocks/{block}',         [ScheduleBlockController::class, 'update']);
    Route::delete('blocks/{block}',      [ScheduleBlockController::class, 'destroy']);

    // Canciones en bloque
    Route::post('blocks/{block}/songs',       [ScheduleBlockController::class, 'addSong']);
    Route::put('block-songs/{blockSong}',     [ScheduleBlockController::class, 'updateSong']);
    Route::delete('block-songs/{blockSong}',  [ScheduleBlockController::class, 'removeSong']);

    // Asignaciones de personas a funciones
    Route::post('blocks/{block}/assignments',        [ScheduleBlockController::class, 'addAssignment']);
    Route::post('blocks/{block}/assignments/bulk',   [ScheduleBlockController::class, 'bulkAssignments']);
    Route::put('assignments/{assignment}',           [ScheduleBlockController::class, 'updateAssignment']);
    Route::delete('assignments/{assignment}',        [ScheduleBlockController::class, 'removeAssignment']);

    // Duplicar bloque (copia canciones + líderes + asignaciones atómicamente)
    Route::post('blocks/{block}/duplicate',          [ScheduleBlockController::class, 'duplicate']);

    // ── Exportaciones ─────────────────────────────────────────────────────
    Route::get('events/{event}/export/excel',        [ExportController::class, 'excel']);

});
