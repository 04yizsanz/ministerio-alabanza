<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Canciones dentro de un bloque de programación.
     *
     * DECISIÓN CLAVE: key_used y bpm_used son INDEPENDIENTES de la canción original.
     * Cambiar la tonalidad aquí NO modifica songs.original_key.
     * Esto permite reutilizar la misma canción con diferentes configuraciones
     * en distintas programaciones sin perder la información original.
     */
    public function up(): void
    {
        Schema::create('block_songs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_block_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->foreignId('song_id')
                  ->constrained()
                  ->restrictOnDelete(); // no borrar canción si está en programaciones
            $table->string('key_used', 10)->nullable();    // tonalidad en esta programación
            $table->unsignedSmallInteger('bpm_used')->nullable(); // BPM en esta programación
            $table->text('structure_notes')->nullable();   // estructura de interpretación
            $table->text('performance_notes')->nullable(); // observaciones del bloque
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['schedule_block_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('block_songs');
    }
};
