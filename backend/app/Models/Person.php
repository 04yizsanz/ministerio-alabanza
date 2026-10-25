<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Person extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'phone',
        'email',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Atributo calculado: nombre completo
    protected $appends = ['full_name'];

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /** Funciones musicales que puede desempeñar esta persona */
    public function musicalRoles(): BelongsToMany
    {
        return $this->belongsToMany(MusicalRole::class, 'person_musical_role');
    }

    /** Asignaciones de esta persona en bloques */
    public function blockAssignments(): HasMany
    {
        return $this->hasMany(BlockAssignment::class);
    }

    /** Canciones que lidera */
    public function blockSongLeaders(): HasMany
    {
        return $this->hasMany(BlockSongLeader::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch(Builder $query, string $term): Builder
    {
        return $query->where(function ($q) use ($term) {
            $q->where('first_name', 'like', "%{$term}%")
              ->orWhere('last_name', 'like', "%{$term}%")
              ->orWhere('email', 'like', "%{$term}%");
        });
    }
}
