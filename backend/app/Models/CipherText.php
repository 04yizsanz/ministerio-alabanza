<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CipherText extends Model
{
    protected $fillable = [
        'song_id',
        'key_signature',
        'intro',
        'verse',
        'pre_chorus',
        'chorus',
        'bridge',
        'interlude',
        'outro',
        'chords',
        'notes',
    ];

    public function song(): BelongsTo
    {
        return $this->belongsTo(Song::class);
    }
}
