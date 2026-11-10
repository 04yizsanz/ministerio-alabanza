<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Song extends Model
{
    use HasFactory;
    protected $fillable = [
        'title',
        'artist',
        'original_key',
        'bpm',
        'audio_url',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'bpm'       => 'integer',
    ];

    // ── Relaciones ────────────────────────────────────────────────────────

    /** Una canción puede tener varios cifrados en texto */
    public function cipherTexts(): HasMany
    {
        return $this->hasMany(CipherText::class);
    }

    /** Una canción puede tener varios archivos adjuntos */
    public function cipherFiles(): HasMany
    {
        return $this->hasMany(CipherFile::class);
    }

    /** Una canción puede aparecer en muchos bloques de programación */
    public function blockSongs(): HasMany
    {
        return $this->hasMany(BlockSong::class);
    }

    // ── Scopes (filtros reutilizables) ────────────────────────────────────

    /** Filtra solo canciones activas */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /** Busca por título o artista */
    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
              ->orWhere('artist', 'like', "%{$term}%");
        });
    }
}
