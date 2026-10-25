<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla pivote muchos-a-muchos entre personas y funciones musicales.
     * Almacena qué funciones puede desempeñar cada persona en general.
     * (Las asignaciones específicas en una programación van en block_assignments)
     */
    public function up(): void
    {
        Schema::create('person_musical_role', function (Blueprint $table) {
            $table->foreignId('person_id')
                  ->constrained('people')
                  ->cascadeOnDelete();
            $table->foreignId('musical_role_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->primary(['person_id', 'musical_role_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_musical_role');
    }
};
