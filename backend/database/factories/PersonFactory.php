<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PersonFactory extends Factory
{
    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName(),
            'last_name'  => $this->faker->lastName(),
            'phone'      => $this->faker->optional(0.5)->phoneNumber(),
            'email'      => $this->faker->boolean(60)
                                ? $this->faker->unique()->safeEmail()
                                : null,
            'notes'      => null,
            'is_active'  => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
