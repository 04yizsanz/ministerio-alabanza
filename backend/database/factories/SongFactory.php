<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SongFactory extends Factory
{
    public function definition(): array
    {
        $keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Am', 'Em', 'Dm', 'Bm', 'Bb'];

        return [
            'title'        => $this->faker->sentence(3),
            'artist'       => $this->faker->name(),
            'original_key' => $this->faker->randomElement($keys),
            'bpm'          => $this->faker->numberBetween(60, 160),
            'audio_url'    => null,
            'notes'        => $this->faker->optional()->sentence(),
            'is_active'    => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
