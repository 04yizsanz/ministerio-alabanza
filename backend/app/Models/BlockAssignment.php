<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlockAssignment extends Model
{
    protected $fillable = [
        'schedule_block_id',
        'musical_role_id',
        'person_id',
        'notes',
    ];

    public function scheduleBlock(): BelongsTo
    {
        return $this->belongsTo(ScheduleBlock::class);
    }

    public function musicalRole(): BelongsTo
    {
        return $this->belongsTo(MusicalRole::class);
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }
}
