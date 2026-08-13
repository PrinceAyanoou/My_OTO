// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
// import { ApprenantService } from './apprenant.service';
// import { CreateApprenantDto } from './dto/create-apprenant.dto';
// import { UpdateApprenantDto } from './dto/update-apprenant.dto';

// @Controller('apprenant')
// export class ApprenantController {
//   constructor(private readonly apprenantService: ApprenantService) {}

//   @Post()
//   create(@Body() createApprenantDto: CreateApprenantDto) {
//     return this.apprenantService.create(createApprenantDto);
//   }

//   @Get()
//   findAll() {
//     return this.apprenantService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.apprenantService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateApprenantDto: UpdateApprenantDto) {
//     return this.apprenantService.update(+id, updateApprenantDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.apprenantService.remove(+id);
//   }
// }
