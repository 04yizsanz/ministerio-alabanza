<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class CipherFile extends Model
{
    protected $fillable = [
        'song_id',
        'original_name',
        'stored_name',
        'mime_type',
        'disk',
        'path',
        'key_signature',
        'file_size',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    // No exponemos 'path' ni 'stored_name' directamente en las respuestas JSON
    protected $hidden = ['path', 'stored_name', 'disk'];

    // Agregamos la URL de descarga como atributo calculado
    protected $appends = ['download_url'];

    public function song(): BelongsTo
    {
        return $this->belongsTo(Song::class);
    }

    /**
     * URL para descargar/visualizar el archivo a través de la API.
     * No exponemos la ruta real del storage — el acceso pasa por un endpoint
     * protegido que verifica la autenticación antes de servir el archivo.
     */
    public function getDownloadUrlAttribute(): string
    {
        return "/api/cipher-files/{$this->id}/download";
    }

    /**
     * Elimina el archivo físico del disco cuando se borra el registro.
     */
    public static function booted(): void
    {
        static::deleting(function (CipherFile $file) {
            Storage::disk($file->disk)->delete($file->path);
        });
    }
}
