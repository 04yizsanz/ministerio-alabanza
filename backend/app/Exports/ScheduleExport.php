<?php

namespace App\Exports;

use App\Models\Event;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

/**
 * ScheduleExport
 *
 * Punto de entrada para la exportación de una programación.
 * Crea una hoja por bloque usando ScheduleBlockSheet.
 *
 * Uso:
 *   Excel::download(new ScheduleExport($event), 'programacion.xlsx');
 */
class ScheduleExport implements WithMultipleSheets
{
    public function __construct(private Event $event)
    {
        // Aseguramos que las relaciones estén cargadas
        $this->event->load([
            'eventType',
            'scheduleBlocks.blockSongs.song',
            'scheduleBlocks.blockSongs.leaders.person',
            'scheduleBlocks.blockAssignments.musicalRole',
            'scheduleBlocks.blockAssignments.person',
        ]);
    }

    public function sheets(): array
    {
        $sheets = [];

        // Si el evento no tiene bloques, creamos una hoja vacía informativa
        if ($this->event->scheduleBlocks->isEmpty()) {
            $sheets[] = new ScheduleBlockSheet(null, $this->event);
            return $sheets;
        }

        foreach ($this->event->scheduleBlocks as $block) {
            $sheets[] = new ScheduleBlockSheet($block, $this->event);
        }

        return $sheets;
    }
}
