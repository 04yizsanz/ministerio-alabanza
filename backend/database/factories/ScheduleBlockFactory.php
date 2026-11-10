<?php

namespace Database\Factories;

use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

class ScheduleBlockFactory extends Factory
{
    public function definition(): array
    {
        return [
            'event_id'           => Event::factory(),
            'name'               => 'Bloque ' . $this->faker->numberBetween(1, 5),
            'block_date'         => null,
            'sort_order'         => $this->faker->numberBetween(0, 10),
            'block_type'         => $this->faker->randomElement(['worship', 'prayer', 'general']),
            'estimated_duration' => null,
            'notes'              => null,
        ];
    }
}
