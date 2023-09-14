import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { PokeResponse } from  "./interfaces/poke-response.interface"
import { CreatePokemonDto } from "../pokemon/dto/create-pokemon.dto";
import { Pokemon } from "../pokemon/entities/pokemon.entity";
import { AxiosAdapter } from "../common/adapters/axios.adapter";

@Injectable()
export class SeedService {
  pokemon: CreatePokemonDto;
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({}); //delete * from pokemons;
    const data = await this.http.get<PokeResponse>(
      "https://pokeapi.co/api/v2/pokemon?limit=650"
    );

    const pokemonToInsert: { name: string; no: number }[] = [];

    data.results.forEach(async ({ name, url }) => {
      const segments = url.split("/");
      const no = +segments[segments.length - 2];

      pokemonToInsert.push({ name, no }); // [{ name: bulbaberto, no: 1 }]
    });

    await this.pokemonModel.insertMany(pokemonToInsert);
    return "Seed executed";
  }
}
