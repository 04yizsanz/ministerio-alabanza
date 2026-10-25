<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cada bloque representa una sesión o sección dentro de un evento.
     * Un evento de Domingo puede tener un bloque.
     * Un CDO puede tener Bloque 1 y Bloque 2 en paralelo.
     * Un campamento puede tener múltiples bloques por día.
     */
    public function up(): void
    {
        Schema::create('schedule_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->string('name');                          // "Bloque 1", "Alabanza", etc.
            $table->date('block_date')->nullable();          // fecha específica del bloque
            $table->integer('sort_order')->default(0);       // orden dentro del evento
            $table->string('block_type', 30)->default('worship'); // worship, prayer, general
            $table->unsignedSmallInteger('estimated_duration')->nullable(); // minutos
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['event_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_blocks');
    }
};
