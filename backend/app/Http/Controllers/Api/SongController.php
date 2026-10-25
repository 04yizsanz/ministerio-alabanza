<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSongRequest;
use App\Http\Requests\UpdateSongRequest;
use App\Models\Song;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SongController extends Controller
{
    /**
     * GET /api/songs
     * Lista paginada con búsqueda y filtros.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Song::query();

        // Búsqueda por título o artista
        if ($search = $request->get('search')) {
            $query->search($search);
        }

        // Filtro por tonalidad
        if ($key = $request->get('key')) {
            $query->where('original_key', $key);
        }

        // Filtro por estado
        if ($request->has('active')) {
            $query->where('is_active', filter_var($request->get('active'), FILTER_VALIDATE_BOOLEAN));
        }

        // Ordenamiento
        $sortBy  = in_array($request->get('sort'), ['title', 'artist', 'bpm', 'created_at']) ? $request->get('sort') : 'title';
        $sortDir = $request->get('direction', 'asc') === 'desc' ? 'desc' : 'asc';
        $query->orderBy($sortBy, $sortDir);

        $songs = $query->paginate($request->get('per_page', 20));

        return response()->json($songs);
    }

    /**
     * POST /api/songs
     */
    public function store(StoreSongRequest $request): JsonResponse
    {
        $song = Song::create($request->validated());

        return response()->json($song, 201);
    }

    /**
     * GET /api/songs/{song}
     * Devuelve la canción con sus cifrados.
     */
    public function show(Song $song): JsonResponse
    {
        $song->load(['cipherTexts', 'cipherFiles']);

        return response()->json($song);
    }

    /**
     * PUT /api/songs/{song}
     */
    public function update(UpdateSongRequest $request, Song $song): JsonResponse
    {
        $song->update($request->validated());

        return response()->json($song);
    }

    /**
     * DELETE /api/songs/{song}
     * Desactiva la canción en lugar de eliminarla para preservar historial.
     */
    public function destroy(Song $song): JsonResponse
    {
        // Si la canción está en programaciones, solo desactivamos
        if ($song->blockSongs()->exists()) {
            $song->update(['is_active' => false]);
            return response()->json([
                'message' => 'La canción fue desactivada porque está en uso en programaciones.',
                'song'    => $song,
            ]);
        }

        $song->delete();

        return response()->json(['message' => 'Canción eliminada correctamente.']);
    }

    /**
     * PATCH /api/songs/{song}/toggle-active
     * Activa o desactiva la canción.
     */
    public function toggleActive(Song $song): JsonResponse
    {
        $song->update(['is_active' => ! $song->is_active]);

        return response()->json([
            'message'   => $song->is_active ? 'Canción activada.' : 'Canción desactivada.',
            'is_active' => $song->is_active,
        ]);
    }
}
