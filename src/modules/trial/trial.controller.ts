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
import { AdminAccess } from '../admin/decorators/admin.decorator';

@Controller('trial')
export class TrialController {
  constructor(private readonly trialService: TrialService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @AdminAccess()
  createTrial(@Body() dto: CreateTrialDto) {
    return this.trialService.createTrial(dto);
  }

  @Post('create-bulk')
  @HttpCode(HttpStatus.CREATED)
  @AdminAccess()
  createTrialsBulk(@Body() dto: CreateTrialsBulkDto) {
    return this.trialService.createTrialsBulk(dto);
  }

  @Get('list')
  @AdminAccess()
  getAllTrials() {
    return this.trialService.getAllTrials();
  }

  @Get('names')
  @AdminAccess()
  getTrialNames() {
    return this.trialService.getTrialNames();
  }

  @Get(':id')
  @AdminAccess()
  getTrialById(@Param('id') id: string) {
    return this.trialService.getTrialById(id);
  }
}

