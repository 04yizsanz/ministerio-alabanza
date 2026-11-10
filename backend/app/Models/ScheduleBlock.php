<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScheduleBlock extends Model
{
    use HasFactory;
    protected $fillable = [
        'event_id',
        'name',
        'block_date',
        'sort_order',
        'block_type',
        'estimated_duration',
        'notes',
    ];

    protected $casts = [
        'block_date'         => 'date',
        'sort_order'         => 'integer',
        'estimated_duration' => 'integer',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /** Canciones del bloque ordenadas por sort_order */
    public function blockSongs(): HasMany
    {
        return $this->hasMany(BlockSong::class)->orderBy('sort_order');
    }

    /** Asignaciones de personas a funciones en este bloque */
    public function blockAssignments(): HasMany
    {
        return $this->hasMany(BlockAssignment::class);
    }
}
