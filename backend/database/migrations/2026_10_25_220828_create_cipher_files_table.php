<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cipher_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('song_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->string('original_name');        // nombre original del archivo
            $table->string('stored_name');          // nombre seguro generado internamente
            $table->string('mime_type', 100);       // "application/pdf", "image/jpeg", etc.
            $table->string('disk', 20)->default('local'); // disco de almacenamiento
            $table->string('path');                 // ruta dentro del disco
            $table->string('key_signature', 10)->nullable(); // tonalidad asociada
            $table->unsignedInteger('file_size');   // tamaño en bytes
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cipher_files');
    }
};
