<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MusicalRoleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'       => $this->faker->unique()->word() . ' ' . $this->faker->word(),
            'category'   => $this->faker->randomElement(['music', 'tech', 'service']),
            'sort_order' => $this->faker->numberBetween(0, 50),
            'is_active'  => true,
        ];
    }
}
