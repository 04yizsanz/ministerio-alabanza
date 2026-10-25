<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlockSongLeader extends Model
{
    protected $fillable = [
        'block_song_id',
        'person_id',
        'role_label',
    ];

    public function blockSong(): BelongsTo
    {
        return $this->belongsTo(BlockSong::class);
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }
}
