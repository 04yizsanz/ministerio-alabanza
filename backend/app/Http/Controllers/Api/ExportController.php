<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Exports\ScheduleExport;
use App\Models\Event;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ExportController extends Controller
{
    /**
     * GET /api/events/{event}/export/excel
     *
     * Descarga la programación completa del evento como archivo .xlsx.
     * Cada bloque se exporta en una pestaña separada.
     */
    public function excel(Event $event): BinaryFileResponse
    {
        // Sanitizar nombre de archivo: quitar caracteres peligrosos
        $name = preg_replace('/[^a-z0-9_\-]/i', '_', $event->name);
        $filename = "programacion_{$name}_{$event->start_date?->format('Y-m-d')}.xlsx";

        return Excel::download(new ScheduleExport($event), $filename);
    }
}
