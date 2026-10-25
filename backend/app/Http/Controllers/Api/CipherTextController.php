<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CipherText;
use App\Models\Song;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CipherTextController extends Controller
{
    /**
     * GET /api/songs/{song}/cipher-texts
     */
    public function index(Song $song): JsonResponse
    {
        return response()->json($song->cipherTexts);
    }

    /**
     * POST /api/songs/{song}/cipher-texts
     */
    public function store(Request $request, Song $song): JsonResponse
    {
        $data = $request->validate([
            'key_signature' => ['nullable', 'string', 'max:10'],
            'intro'         => ['nullable', 'string'],
            'verse'         => ['nullable', 'string'],
            'pre_chorus'    => ['nullable', 'string'],
            'chorus'        => ['nullable', 'string'],
            'bridge'        => ['nullable', 'string'],
            'interlude'     => ['nullable', 'string'],
            'outro'         => ['nullable', 'string'],
            'chords'        => ['nullable', 'string'],
            'notes'         => ['nullable', 'string'],
        ]);

        $cipher = $song->cipherTexts()->create($data);

        return response()->json($cipher, 201);
    }

    /**
     * PUT /api/cipher-texts/{cipherText}
     */
    public function update(Request $request, CipherText $cipherText): JsonResponse
    {
        $data = $request->validate([
            'key_signature' => ['nullable', 'string', 'max:10'],
            'intro'         => ['nullable', 'string'],
            'verse'         => ['nullable', 'string'],
            'pre_chorus'    => ['nullable', 'string'],
            'chorus'        => ['nullable', 'string'],
            'bridge'        => ['nullable', 'string'],
            'interlude'     => ['nullable', 'string'],
            'outro'         => ['nullable', 'string'],
            'chords'        => ['nullable', 'string'],
            'notes'         => ['nullable', 'string'],
        ]);

        $cipherText->update($data);

        return response()->json($cipherText);
    }

    /**
     * DELETE /api/cipher-texts/{cipherText}
     */
    public function destroy(CipherText $cipherText): JsonResponse
    {
        $cipherText->delete();
        return response()->json(['message' => 'Cifrado eliminado.']);
    }
}
