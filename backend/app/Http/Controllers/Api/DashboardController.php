<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Person;
use App\Models\ScheduleBlock;
use App\Models\Song;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        // Próximos eventos (los que vienen desde hoy)
        $upcomingEvents = Event::with('eventType')
            ->upcoming()
            ->limit(5)
            ->get(['id', 'name', 'start_date', 'end_date', 'status', 'event_type_id']);

        // Eventos recientes (últimos 5 creados o actualizados)
        $recentEvents = Event::with('eventType')
            ->withCount('scheduleBlocks')
            ->orderByDesc('updated_at')
            ->limit(5)
            ->get(['id', 'name', 'start_date', 'status', 'event_type_id', 'updated_at']);

        // Distribución de canciones por tonalidad (top 8)
        $songsByKey = Song::where('is_active', true)
            ->whereNotNull('original_key')
            ->select('original_key', DB::raw('count(*) as total'))
            ->groupBy('original_key')
            ->orderByDesc('total')
            ->limit(8)
            ->get();

        // Próximo evento con su programación completa
        $nextEvent = Event::with([
            'eventType',
            'scheduleBlocks.blockSongs.song',
            'scheduleBlocks.blockAssignments.musicalRole',
            'scheduleBlocks.blockAssignments.person',
        ])
        ->upcoming()
        ->published()
        ->first();

        $data = [
            // Conteos principales
            'songs_count'     => Song::where('is_active', true)->count(),
            'people_count'    => Person::where('is_active', true)->count(),
            'events_count'    => Event::whereIn('status', ['draft', 'published'])->count(),
            'schedules_count' => ScheduleBlock::count(),

            // Listas
            'upcoming_events' => $upcomingEvents,
            'recent_events'   => $recentEvents,
            'songs_by_key'    => $songsByKey,
            'next_event'      => $nextEvent,
        ];

        return response()->json(['data' => $data]);
    }
}
