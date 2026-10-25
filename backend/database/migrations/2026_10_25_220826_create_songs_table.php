<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('songs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('artist')->nullable();
            $table->string('original_key', 10)->nullable();  // "C", "G#", "Bbm", etc.
            $table->unsignedSmallInteger('bpm')->nullable();
            $table->string('audio_url')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Índice para búsqueda rápida por título y artista
            $table->index(['title', 'artist']);
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('songs');
    }
};
