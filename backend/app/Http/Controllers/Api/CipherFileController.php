<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCipherFileRequest;
use App\Models\CipherFile;
use App\Models\Song;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CipherFileController extends Controller
{
    /**
     * GET /api/songs/{song}/cipher-files
     */
    public function index(Song $song): JsonResponse
    {
        return response()->json($song->cipherFiles);
    }

    /**
     * POST /api/songs/{song}/cipher-files
     * Sube un archivo PDF o imagen y registra sus metadatos.
     */
    public function store(StoreCipherFileRequest $request, Song $song): JsonResponse
    {
        $file = $request->file('file');

        // Generamos un nombre único y seguro — nunca usamos el nombre original
        // directamente para evitar path traversal y colisiones
        $storedName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path       = "cipher-files/{$song->id}/{$storedName}";

        // Guardamos en disco 'local' (privado — no accesible por URL pública)
        Storage::disk('local')->put($path, file_get_contents($file));

        $cipherFile = $song->cipherFiles()->create([
            'original_name' => $file->getClientOriginalName(),
            'stored_name'   => $storedName,
            'mime_type'     => $file->getMimeType(),
            'disk'          => 'local',
            'path'          => $path,
            'key_signature' => $request->input('key_signature'),
            'file_size'     => $file->getSize(),
        ]);

        return response()->json($cipherFile, 201);
    }

    /**
     * GET /api/cipher-files/{cipherFile}/download
     * Descarga el archivo verificando que el usuario esté autenticado.
     * Al pasar por este endpoint (protegido por auth:sanctum) el archivo
     * nunca es accesible por URL pública directa.
     */
    public function download(CipherFile $cipherFile)
    {
        if (! Storage::disk($cipherFile->disk)->exists($cipherFile->path)) {
            return response()->json(['message' => 'Archivo no encontrado.'], 404);
        }

        return Storage::disk($cipherFile->disk)->download(
            $cipherFile->path,
            $cipherFile->original_name
        );
    }

    /**
     * DELETE /api/cipher-files/{cipherFile}
     * Elimina el registro y el archivo físico (via CipherFile::booted).
     */
    public function destroy(CipherFile $cipherFile): JsonResponse
    {
        $cipherFile->delete(); // el modelo elimina el archivo en booted()
        return response()->json(['message' => 'Archivo eliminado.']);
    }
}
