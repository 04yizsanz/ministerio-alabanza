<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class EventTypeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'      => $this->faker->unique()->word(),
            'slug'      => $this->faker->unique()->slug(1),
            'color'     => $this->faker->hexColor(),
            'is_active' => true,
        ];
    }
}
