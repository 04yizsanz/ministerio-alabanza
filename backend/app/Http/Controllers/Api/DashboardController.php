<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Person;
use App\Models\ScheduleBlock;
use App\Models\Song;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $data = [
            'songs_count'     => Song::where('is_active', true)->count(),
            'people_count'    => Person::where('is_active', true)->count(),
            'events_count'    => Event::count(),
            'schedules_count' => ScheduleBlock::count(),
            'upcoming_events' => Event::with('eventType')
                ->upcoming()
                ->limit(5)
                ->get(['id', 'name', 'start_date', 'event_type_id']),
        ];

        return response()->json(['data' => $data]);
    }
}
