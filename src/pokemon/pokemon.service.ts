import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Model, isValidObjectId } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { CreatePokemonDto } from "./dto/create-pokemon.dto";
import { UpdatePokemonDto } from "./dto/update-pokemon.dto";
import { Pokemon } from "./entities/pokemon.entity";

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);

      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    // By no
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    //By Id
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    //By name
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: term.toLowerCase().trim(),
      });
    }
    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon with id, name or no: ${term} not found!`
      );
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }

    try {
      await pokemon.updateOne(updatePokemonDto, { new: false }); //return new object = false v

      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(term: string) {
    // const pokemon = await this.findOne(term);
    // await pokemon.deleteOne();
    //const result = this.pokemonModel.findByIdAndDelete(term);
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: term });
    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id "${ term}" not found`)
    }
    return;
  }

  handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon already exists in DB ${JSON.stringify(error.keyValue)}`
      );
    }
    console.log(error);
    throw new InternalServerErrorException(
      "Can't create Pokemon - Check Server Logs!"
    );
  }
}
