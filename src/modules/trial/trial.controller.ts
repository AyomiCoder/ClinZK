import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TrialService } from './trial.service';
import { CreateTrialDto } from './dto/create-trial.dto';
import { CreateTrialsBulkDto } from './dto/create-trials-bulk.dto';

@Controller('trial')
export class TrialController {
  constructor(private readonly trialService: TrialService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  createTrial(@Body() dto: CreateTrialDto) {
    return this.trialService.createTrial(dto);
  }

  @Post('create-bulk')
  @HttpCode(HttpStatus.CREATED)
  createTrialsBulk(@Body() dto: CreateTrialsBulkDto) {
    return this.trialService.createTrialsBulk(dto);
  }

  @Get('list')
  getAllTrials() {
    return this.trialService.getAllTrials();
  }

  @Get('names')
  getTrialNames() {
    return this.trialService.getTrialNames();
  }

  @Get(':id')
  getTrialById(@Param('id') id: string) {
    return this.trialService.getTrialById(id);
  }
}

