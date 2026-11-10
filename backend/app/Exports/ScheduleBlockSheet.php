<?php

namespace App\Exports;

use App\Models\Event;
use App\Models\ScheduleBlock;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * ScheduleBlockSheet
 *
 * Genera una hoja de Excel para un bloque de programación.
 *
 * Estructura de la hoja:
 *   Fila 1: MINISTERIO DE ALABANZA (título fusionado)
 *   Fila 2: Tipo de evento | Fecha
 *   Fila 3: Cabeceras de columnas
 *   Filas 4+: Datos (equipo izquierdo | canciones derecho)
 *
 * Los colores se adaptan al tipo de evento:
 *   - Domingo → rosado/rojo  (#e8003a)
 *   - CDO     → morado       (#7c3aed)
 *   - Otros   → color del tipo de evento
 */
class ScheduleBlockSheet implements FromArray, WithTitle, WithStyles, WithColumnWidths, WithEvents
{
    // Paleta de colores
    private string $accentColor;
    private string $accentLight;

    // Orden visual de las funciones musicales
    private const ROLE_ORDER = [
        'Dirección de alabanza',
        'Cantante',
        'Coro de apoyo',
        'Talkback',
        'Teclados',
        'Bajo',
        'Batería',
        'Cajón peruano',
        'Guitarra acústica',
        'Guitarra eléctrica',
        'Sonido',
        'Sonido de streaming',
        'Computador y ProPresenter',
        'Computador de transmisión',
        'Encargado de turno',
        'Servidor',
        'Escenario',
        'Danza',
    ];

    public function __construct(
        private ?ScheduleBlock $block,
        private Event $event
    ) {
        // Derivar color del tipo de evento
        $hex = ltrim($this->event->eventType?->color ?? '#6b7280', '#');
        $this->accentColor = $hex;

        // Generar versión clara (mezcla con blanco al 85%)
        [$r, $g, $b] = sscanf('#' . $hex, '#%02x%02x%02x');
        $lr = (int) round($r + (255 - $r) * 0.75);
        $lg = (int) round($g + (255 - $g) * 0.75);
        $lb = (int) round($b + (255 - $b) * 0.75);
        $this->accentLight = sprintf('%02x%02x%02x', $lr, $lg, $lb);
    }

    // ── Título de la pestaña ─────────────────────────────────────────────────

    public function title(): string
    {
        if (!$this->block) {
            return 'Sin bloques';
        }
        // Excel limita el título de la hoja a 31 caracteres
        return mb_substr($this->block->name, 0, 31);
    }

    // ── Datos de la hoja ─────────────────────────────────────────────────────

    public function array(): array
    {
        $rows = [];

        // Fila 1: título
        $rows[] = ['MINISTERIO DE ALABANZA', '', '', '', '', '', ''];

        // Fila 2: tipo + fecha
        $typeName = strtoupper($this->event->eventType?->name ?? 'EVENTO');
        $dateStr  = $this->block?->block_date
            ? $this->block->block_date->format('d/m/Y')
            : ($this->event->start_date?->format('d/m/Y') ?? '');
        $rows[] = [$typeName, $dateStr, '', '', '', '', ''];

        // Fila 3: cabeceras
        $rows[] = ['Función', 'Integrante', '#', 'Canción', 'Ton.', 'Estructura', 'Responsable'];

        if (!$this->block) {
            $rows[] = ['', 'Sin bloques de programación', '', '', '', '', ''];
            return $rows;
        }

        // Construir mapa rol → personas
        $roleMap = [];
        foreach ($this->block->blockAssignments as $a) {
            if (!$a->musicalRole) continue;
            $name = $a->musicalRole->name;
            if (!isset($roleMap[$name])) $roleMap[$name] = [];
            if ($a->person) $roleMap[$name][] = trim("{$a->person->first_name} {$a->person->last_name}");
        }

        // Ordenar roles según el orden predefinido
        $teamRows = [];
        $used     = [];
        foreach (self::ROLE_ORDER as $roleName) {
            if (array_key_exists($roleName, $roleMap)) {
                $teamRows[] = ['role' => $roleName, 'people' => $roleMap[$roleName]];
                $used[]     = $roleName;
            }
        }
        foreach ($roleMap as $roleName => $people) {
            if (!in_array($roleName, $used)) {
                $teamRows[] = ['role' => $roleName, 'people' => $people];
            }
        }

        $songs    = $this->block->blockSongs;
        $rowCount = max(count($teamRows), $songs->count(), 1);

        for ($i = 0; $i < $rowCount; $i++) {
            $teamRow = $teamRows[$i] ?? null;
            $song    = $songs[$i] ?? null;

            $leader = '';
            if ($song && $song->leaders->isNotEmpty() && $song->leaders->first()->person) {
                $p      = $song->leaders->first()->person;
                $leader = trim("{$p->first_name} {$p->last_name}");
            }

            $rows[] = [
                $teamRow['role']                            ?? '',
                $teamRow ? implode(', ', $teamRow['people'] ?: ['—']) : '',
                $song ? ($i + 1)                           : '',
                $song?->song?->title                       ?? '',
                $song?->key_used                           ?? '',
                $song?->structure_notes                    ?? '',
                $leader,
            ];
        }

        return $rows;
    }

    // ── Anchos de columna ────────────────────────────────────────────────────

    public function columnWidths(): array
    {
        return [
            'A' => 26,   // Función
            'B' => 24,   // Integrante
            'C' => 4,    // #
            'D' => 30,   // Canción
            'E' => 7,    // Tonalidad
            'F' => 22,   // Estructura
            'G' => 22,   // Responsable
        ];
    }

    // ── Estilos básicos ──────────────────────────────────────────────────────

    public function styles(Worksheet $sheet): array
    {
        return [];  // Los estilos avanzados se aplican en WithEvents
    }

    // ── Estilos avanzados via AfterSheet ─────────────────────────────────────

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $this->applyStyles($sheet);
            },
        ];
    }

    private function applyStyles(Worksheet $sheet): void
    {
        $accent      = $this->accentColor;
        $accentLight = $this->accentLight;
        $lastRow     = $sheet->getHighestRow();

        // ── Fila 1: título principal ──────────────────────────────────────────
        $sheet->mergeCells('A1:G1');
        $sheet->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF' . $accent]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(22);

        // ── Fila 2: tipo + fecha ──────────────────────────────────────────────
        $sheet->mergeCells('B2:G2');
        $sheet->getStyle('A2:G2')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 13, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF' . $accent]],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle('B2')->applyFromArray([
            'font' => ['bold' => false, 'size' => 11],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(20);

        // ── Fila 3: cabeceras ─────────────────────────────────────────────────
        $sheet->getStyle('A3:G3')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 10, 'color' => ['argb' => 'FF' . $accent]],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF' . $accentLight]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF' . $accent]]],
        ]);
        $sheet->getRowDimension(3)->setRowHeight(16);

        // ── Filas de datos ────────────────────────────────────────────────────
        for ($row = 4; $row <= $lastRow; $row++) {
            $isAlt = ($row % 2 === 0);

            // Columna A (función): fondo claro con color acento
            $sheet->getStyle("A{$row}")->applyFromArray([
                'font'      => ['bold' => true, 'size' => 9, 'color' => ['argb' => 'FF' . $accent]],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF' . $accentLight]],
                'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FF' . $accent . '88']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            // Columna B (integrante)
            $bgB = $isAlt ? ('FF' . $accentLight) : 'FFFAFAFA';
            $sheet->getStyle("B{$row}")->applyFromArray([
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bgB]],
                'font'      => ['size' => 10],
                'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFD1D5DB']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            // Columna C (#) — centrado
            $sheet->getStyle("C{$row}")->applyFromArray([
                'font'      => ['size' => 9, 'color' => ['argb' => 'FFAAAAAA']],
                'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFD1D5DB']]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ]);

            // Columna D (canción) — negrita
            $bgD = $isAlt ? ('FF' . $accentLight) : 'FFFFFFFF';
            $sheet->getStyle("D{$row}")->applyFromArray([
                'font'      => ['bold' => true, 'size' => 10],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => $bgD]],
                'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFD1D5DB']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            // Columna E (tonalidad) — centrado, color acento
            $sheet->getStyle("E{$row}")->applyFromArray([
                'font'      => ['bold' => true, 'size' => 10, 'color' => ['argb' => 'FF' . $accent]],
                'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFD1D5DB']]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ]);

            // Columnas F y G
            $sheet->getStyle("F{$row}:G{$row}")->applyFromArray([
                'font'      => ['size' => 9, 'color' => ['argb' => 'FF555555']],
                'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'FFD1D5DB']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            $sheet->getRowDimension($row)->setRowHeight(15);
        }

        // ── Alineación del número de canción ─────────────────────────────────
        $sheet->getStyle("C3:C{$lastRow}")->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // ── Borde exterior general ────────────────────────────────────────────
        $sheet->getStyle("A1:G{$lastRow}")->applyFromArray([
            'borders' => [
                'outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => 'FF' . $accent]],
            ],
        ]);

        // ── Configuración de página para impresión ────────────────────────────
        $sheet->getPageSetup()
            ->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE)
            ->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4)
            ->setFitToWidth(1)
            ->setFitToHeight(0);

        $sheet->getPageMargins()
            ->setTop(0.5)->setRight(0.5)->setBottom(0.5)->setLeft(0.5);

        // Congelar cabeceras al hacer scroll
        $sheet->freezePane('A4');
    }
}
