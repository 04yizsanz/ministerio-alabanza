<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cipher_texts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('song_id')
                  ->constrained()
                  ->cascadeOnDelete(); // si se elimina la canción, se elimina el cifrado
            $table->string('key_signature', 10)->nullable(); // tonalidad de este cifrado
            $table->text('intro')->nullable();
            $table->text('verse')->nullable();        // verso
            $table->text('pre_chorus')->nullable();   // precoro
            $table->text('chorus')->nullable();       // coro
            $table->text('bridge')->nullable();       // puente
            $table->text('interlude')->nullable();    // interludio
            $table->text('outro')->nullable();        // final
            $table->text('chords')->nullable();       // acordes adicionales
            $table->text('notes')->nullable();        // observaciones
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cipher_texts');
    }
};
