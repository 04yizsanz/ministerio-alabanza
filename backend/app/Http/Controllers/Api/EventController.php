<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Event::with('eventType')
            ->withCount('scheduleBlocks');

        if ($typeId = $request->get('event_type_id')) {
            $query->where('event_type_id', $typeId);
        }
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }
        if ($upcoming = $request->get('upcoming')) {
            $query->upcoming();
        }

        $events = $query->orderByDesc('start_date')
                        ->paginate($request->get('per_page', 15));

        return response()->json($events);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'event_type_id' => ['required', 'exists:event_types,id'],
            'name'          => ['required', 'string', 'max:255'],
            'start_date'    => ['required', 'date'],
            'end_date'      => ['nullable', 'date', 'after_or_equal:start_date'],
            'description'   => ['nullable', 'string'],
            'status'        => ['in:draft,published,archived'],
            'notes'         => ['nullable', 'string'],
        ]);

        $event = Event::create($data);
        $event->load('eventType');

        return response()->json($event, 201);
    }

    public function show(Event $event): JsonResponse
    {
        $event->load([
            'eventType',
            'scheduleBlocks.blockSongs.song',
            'scheduleBlocks.blockSongs.leaders.person',
            'scheduleBlocks.blockAssignments.musicalRole',
            'scheduleBlocks.blockAssignments.person',
        ]);

        return response()->json($event);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        $data = $request->validate([
            'event_type_id' => ['sometimes', 'exists:event_types,id'],
            'name'          => ['sometimes', 'required', 'string', 'max:255'],
            'start_date'    => ['sometimes', 'required', 'date'],
            'end_date'      => ['nullable', 'date'],
            'description'   => ['nullable', 'string'],
            'status'        => ['in:draft,published,archived'],
            'notes'         => ['nullable', 'string'],
        ]);

        $event->update($data);
        $event->load('eventType');

        return response()->json($event);
    }

    public function destroy(Event $event): JsonResponse
    {
        // Solo archivamos — no eliminamos para preservar el historial
        $event->update(['status' => 'archived']);
        return response()->json(['message' => 'Evento archivado correctamente.']);
    }

    /** GET /api/event-types */
    public function types(): JsonResponse
    {
        return response()->json(EventType::where('is_active', true)->orderBy('name')->get());
    }
}
