import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { EmploiDuTempsService } from './emploi-du-temps.service';
import {
  CreateEmploiDuTempsDto,
  QueryEmploiDuTempsDto,
  UpdateEmploiDuTempsDto,
} from './dto/emploi-du-temp.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { PoliciesGuard } from '../auth/guards/permissions.guard';
import { CheckPolicies } from '../auth/decorators/check-permissions.decorator';
import {
  permission_action,
  permission_cible,
} from 'src/generated/prisma/client';

@ApiTags('Emplois du temps')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, PoliciesGuard)
@UsePipes(ZodValidationPipe)
@Controller('ecoles/:ecoleId/emplois-du-temps')
export class EmploiDuTempsController {
  constructor(private readonly emploiDuTempsService: EmploiDuTempsService) {}

  @Post()
  @CheckPolicies((ability) =>
    ability.can(permission_action.CREATE, permission_cible.emploiDuTemps),
  )
  create(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Body() dto: CreateEmploiDuTempsDto,
  ) {
    return this.emploiDuTempsService.create(ecoleId, dto);
  }

  @Get()
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.emploiDuTemps),
  )
  findAll(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Query() query: QueryEmploiDuTempsDto,
  ) {
    return this.emploiDuTempsService.findAll(ecoleId, query);
  }

  @Get(':id')
  @CheckPolicies((ability) =>
    ability.can(permission_action.READ, permission_cible.emploiDuTemps),
  )
  findOne(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.emploiDuTempsService.findOne(ecoleId, id);
  }

  @Patch(':id')
  @CheckPolicies((ability) =>
    ability.can(permission_action.UPDATE, permission_cible.emploiDuTemps),
  )
  update(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmploiDuTempsDto,
  ) {
    return this.emploiDuTempsService.update(ecoleId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @CheckPolicies((ability) =>
    ability.can(permission_action.DELETE, permission_cible.emploiDuTemps),
  )
  remove(
    @Param('ecoleId', ParseUUIDPipe) ecoleId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.emploiDuTempsService.remove(ecoleId, id);
  }
}
