<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlockAssignment;
use App\Models\BlockSong;
use App\Models\BlockSongLeader;
use App\Models\Event;
use App\Models\ScheduleBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduleBlockController extends Controller
{
    /**
     * GET /api/events/{event}/blocks
     * Carga todos los bloques de un evento con sus relaciones.
     */
    public function index(Event $event): JsonResponse
    {
        $blocks = $event->scheduleBlocks()->with([
            'blockSongs.song',
            'blockSongs.leaders.person',
            'blockAssignments.musicalRole',
            'blockAssignments.person',
        ])->get();

        return response()->json($blocks);
    }

    /**
     * POST /api/events/{event}/blocks
     */
    public function store(Request $request, Event $event): JsonResponse
    {
        $data = $request->validate([
            'name'               => ['required', 'string', 'max:255'],
            'block_date'         => ['nullable', 'date'],
            'sort_order'         => ['integer', 'min:0'],
            'block_type'         => ['string', 'max:30'],
            'estimated_duration' => ['nullable', 'integer', 'min:1'],
            'notes'              => ['nullable', 'string'],
        ]);

        // Si no se especifica sort_order, colocarlo al final
        if (!isset($data['sort_order'])) {
            $data['sort_order'] = $event->scheduleBlocks()->max('sort_order') + 1 ?? 0;
        }

        $block = $event->scheduleBlocks()->create($data);

        return response()->json($block, 201);
    }

    /**
     * PUT /api/blocks/{block}
     */
    public function update(Request $request, ScheduleBlock $block): JsonResponse
    {
        $data = $request->validate([
            'name'               => ['sometimes', 'required', 'string', 'max:255'],
            'block_date'         => ['nullable', 'date'],
            'sort_order'         => ['integer', 'min:0'],
            'block_type'         => ['string', 'max:30'],
            'estimated_duration' => ['nullable', 'integer', 'min:1'],
            'notes'              => ['nullable', 'string'],
        ]);

        $block->update($data);

        return response()->json($block);
    }

    /**
     * DELETE /api/blocks/{block}
     */
    public function destroy(ScheduleBlock $block): JsonResponse
    {
        $block->delete();
        return response()->json(['message' => 'Bloque eliminado.']);
    }

    // ── Canciones del bloque ──────────────────────────────────────────────

    /**
     * POST /api/blocks/{block}/songs
     * Agrega una canción del catálogo a un bloque con sus configuraciones.
     * Usa transacción porque puede crear también los líderes.
     */
    public function addSong(Request $request, ScheduleBlock $block): JsonResponse
    {
        $data = $request->validate([
            'song_id'           => ['required', 'exists:songs,id'],
            'key_used'          => ['nullable', 'string', 'max:10'],
            'bpm_used'          => ['nullable', 'integer', 'min:40', 'max:300'],
            'structure_notes'   => ['nullable', 'string'],
            'performance_notes' => ['nullable', 'string'],
            'sort_order'        => ['integer', 'min:0'],
            'leaders'           => ['nullable', 'array'],
            'leaders.*.person_id'  => ['nullable', 'exists:people,id'],
            'leaders.*.role_label' => ['nullable', 'string', 'max:50'],
        ]);

        $blockSong = DB::transaction(function () use ($data, $block) {
            if (!isset($data['sort_order'])) {
                $data['sort_order'] = $block->blockSongs()->max('sort_order') + 1 ?? 0;
            }

            $blockSong = $block->blockSongs()->create([
                'song_id'           => $data['song_id'],
                'key_used'          => $data['key_used'] ?? null,
                'bpm_used'          => $data['bpm_used'] ?? null,
                'structure_notes'   => $data['structure_notes'] ?? null,
                'performance_notes' => $data['performance_notes'] ?? null,
                'sort_order'        => $data['sort_order'],
            ]);

            foreach ($data['leaders'] ?? [] as $leader) {
                $blockSong->leaders()->create($leader);
            }

            return $blockSong;
        });

        $blockSong->load(['song', 'leaders.person']);

        return response()->json($blockSong, 201);
    }

    /**
     * PUT /api/block-songs/{blockSong}
     * Actualiza tonalidad, estructura, responsables de una canción en el bloque.
     */
    public function updateSong(Request $request, BlockSong $blockSong): JsonResponse
    {
        $data = $request->validate([
            'key_used'          => ['nullable', 'string', 'max:10'],
            'bpm_used'          => ['nullable', 'integer'],
            'structure_notes'   => ['nullable', 'string'],
            'performance_notes' => ['nullable', 'string'],
            'sort_order'        => ['integer', 'min:0'],
            'leaders'           => ['nullable', 'array'],
            'leaders.*.person_id'  => ['nullable', 'exists:people,id'],
            'leaders.*.role_label' => ['nullable', 'string', 'max:50'],
        ]);

        DB::transaction(function () use ($data, $blockSong) {
            $blockSong->update($data);

            if (array_key_exists('leaders', $data)) {
                // Reemplazar todos los líderes
                $blockSong->leaders()->delete();
                foreach ($data['leaders'] ?? [] as $leader) {
                    $blockSong->leaders()->create($leader);
                }
            }
        });

        $blockSong->load(['song', 'leaders.person']);

        return response()->json($blockSong);
    }

    /**
     * DELETE /api/block-songs/{blockSong}
     */
    public function removeSong(BlockSong $blockSong): JsonResponse
    {
        $blockSong->delete();
        return response()->json(['message' => 'Canción removida del bloque.']);
    }

    // ── Asignaciones de personas a funciones ──────────────────────────────

    /**
     * POST /api/blocks/{block}/assignments
     * Asigna una persona a una función en el bloque.
     */
    public function addAssignment(Request $request, ScheduleBlock $block): JsonResponse
    {
        $data = $request->validate([
            'musical_role_id' => ['required', 'exists:musical_roles,id'],
            'person_id'       => ['nullable', 'exists:people,id'],
            'notes'           => ['nullable', 'string'],
        ]);

        $assignment = $block->blockAssignments()->create($data);
        $assignment->load(['musicalRole', 'person']);

        return response()->json($assignment, 201);
    }

    /**
     * PUT /api/assignments/{assignment}
     */
    public function updateAssignment(Request $request, BlockAssignment $assignment): JsonResponse
    {
        $data = $request->validate([
            'person_id' => ['nullable', 'exists:people,id'],
            'notes'     => ['nullable', 'string'],
        ]);

        $assignment->update($data);
        $assignment->load(['musicalRole', 'person']);

        return response()->json($assignment);
    }

    /**
     * DELETE /api/assignments/{assignment}
     */
    public function removeAssignment(BlockAssignment $assignment): JsonResponse
    {
        $assignment->delete();
        return response()->json(['message' => 'Asignación eliminada.']);
    }

    /**
     * POST /api/blocks/{block}/duplicate
     * Duplica un bloque completo (canciones + líderes + asignaciones) de forma atómica.
     */
    public function duplicate(ScheduleBlock $block): JsonResponse
    {
        $newBlock = DB::transaction(function () use ($block) {
            // Cargar relaciones si aún no están cargadas
            $block->load([
                'blockSongs.leaders',
                'blockAssignments',
            ]);

            // 1. Crear bloque nuevo en el mismo evento
            $sortOrder = $block->event->scheduleBlocks()->max('sort_order') + 1;

            $newBlock = $block->event->scheduleBlocks()->create([
                'name'               => $block->name . ' (copia)',
                'block_date'         => $block->block_date,
                'sort_order'         => $sortOrder,
                'block_type'         => $block->block_type,
                'estimated_duration' => $block->estimated_duration,
                'notes'              => $block->notes,
            ]);

            // 2. Copiar canciones con sus líderes
            foreach ($block->blockSongs as $bs) {
                $newBs = $newBlock->blockSongs()->create([
                    'song_id'           => $bs->song_id,
                    'key_used'          => $bs->key_used,
                    'bpm_used'          => $bs->bpm_used,
                    'structure_notes'   => $bs->structure_notes,
                    'performance_notes' => $bs->performance_notes,
                    'sort_order'        => $bs->sort_order,
                ]);

                foreach ($bs->leaders as $leader) {
                    $newBs->leaders()->create([
                        'person_id'  => $leader->person_id,
                        'role_label' => $leader->role_label,
                    ]);
                }
            }

            // 3. Copiar asignaciones de personas a funciones
            foreach ($block->blockAssignments as $a) {
                $newBlock->blockAssignments()->create([
                    'musical_role_id' => $a->musical_role_id,
                    'person_id'       => $a->person_id,
                    'notes'           => $a->notes,
                ]);
            }

            return $newBlock;
        });

        // Cargar relaciones para devolver el bloque completo
        $newBlock->load([
            'blockSongs.song',
            'blockSongs.leaders.person',
            'blockAssignments.musicalRole',
            'blockAssignments.person',
        ]);

        return response()->json($newBlock, 201);
    }

    /**
     * POST /api/blocks/{block}/assignments/bulk
     * Reemplaza TODAS las asignaciones de un bloque en una sola operación.
     * Útil para guardar el estado completo del editor de programación.
     */
    public function bulkAssignments(Request $request, ScheduleBlock $block): JsonResponse
    {
        $data = $request->validate([
            'assignments'                   => ['required', 'array'],
            'assignments.*.musical_role_id' => ['required', 'exists:musical_roles,id'],
            'assignments.*.person_id'       => ['nullable', 'exists:people,id'],
            'assignments.*.notes'           => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($data, $block) {
            $block->blockAssignments()->delete();
            foreach ($data['assignments'] as $a) {
                $block->blockAssignments()->create($a);
            }
        });

        $block->load(['blockAssignments.musicalRole', 'blockAssignments.person']);

        return response()->json($block->blockAssignments);
    }
}
