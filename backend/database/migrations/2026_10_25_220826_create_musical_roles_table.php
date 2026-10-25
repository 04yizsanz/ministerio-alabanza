<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('musical_roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');                        // "Cantante", "Teclados", etc.
            $table->string('category')->default('music');  // "music", "tech", "service"
            $table->integer('sort_order')->default(0);     // orden en la plantilla
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('musical_roles');
    }
};
