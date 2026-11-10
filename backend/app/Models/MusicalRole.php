<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class MusicalRole extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'category',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'sort_order' => 'integer',
    ];

    /** Personas que pueden desempeñar esta función */
    public function people(): BelongsToMany
    {
        return $this->belongsToMany(Person::class, 'person_musical_role');
    }

    /** Asignaciones de esta función en bloques de programación */
    public function blockAssignments(): HasMany
    {
        return $this->hasMany(BlockAssignment::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
