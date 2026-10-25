<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_type_id')
                  ->constrained()
                  ->restrictOnDelete(); // no borrar tipo si tiene eventos
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->text('description')->nullable();
            $table->string('status', 20)->default('draft'); // draft, published, archived
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('start_date');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
