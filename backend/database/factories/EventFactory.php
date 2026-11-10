<?php

namespace Database\Factories;

use App\Models\EventType;
use Illuminate\Database\Eloquent\Factories\Factory;

class EventFactory extends Factory
{
    public function definition(): array
    {
        $start = $this->faker->dateTimeBetween('-1 month', '+2 months');

        return [
            'event_type_id' => EventType::factory(),
            'name'          => 'Evento ' . $this->faker->words(2, true),
            'start_date'    => $start->format('Y-m-d'),
            'end_date'      => null,
            'description'   => $this->faker->optional()->sentence(),
            'status'        => $this->faker->randomElement(['draft', 'published']),
            'notes'         => null,
        ];
    }
}
