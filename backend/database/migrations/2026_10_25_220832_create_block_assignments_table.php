<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Asignaciones de personas a funciones musicales/técnicas en un bloque.
     * Ej: "María → Cantante en Bloque 1 del Domingo 26 de oct."
     *
     * Una misma función puede tener varias personas asignadas.
     * Una persona puede tener varias funciones en el mismo bloque.
     */
    public function up(): void
    {
        Schema::create('block_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_block_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->foreignId('musical_role_id')
                  ->constrained()
                  ->restrictOnDelete();
            $table->foreignId('person_id')
                  ->nullable()
                  ->constrained('people')
                  ->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['schedule_block_id', 'musical_role_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('block_assignments');
    }
};
