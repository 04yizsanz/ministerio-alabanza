<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BlockSong extends Model
{
    protected $fillable = [
        'schedule_block_id',
        'song_id',
        'key_used',
        'bpm_used',
        'structure_notes',
        'performance_notes',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'bpm_used'   => 'integer',
    ];

    public function scheduleBlock(): BelongsTo
    {
        return $this->belongsTo(ScheduleBlock::class);
    }

    /** La canción del catálogo (datos originales) */
    public function song(): BelongsTo
    {
        return $this->belongsTo(Song::class);
    }

    /** Personas responsables de esta canción en el bloque */
    public function leaders(): HasMany
    {
        return $this->hasMany(BlockSongLeader::class);
    }
}
