<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Responsables de cada canción dentro de un bloque.
     * Permite asignar una o varias personas a cada canción.
     * role_label permite indicar "Líder", "Apoyo", "N/A", etc.
     */
    public function up(): void
    {
        Schema::create('block_song_leaders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('block_song_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->foreignId('person_id')
                  ->nullable() // nullable para permitir "N/A" sin persona real
                  ->constrained('people')
                  ->nullOnDelete();
            $table->string('role_label', 50)->nullable(); // "Líder", "Apoyo", "N/A"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('block_song_leaders');
    }
};
