import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateTotpAccountDto } from './dto/create-totp-account.dto.js';
import { TotpService } from './totp.service.js';

@ApiTags('totp')
@ApiSecurity('api-key')
@Controller('totp')
export class TotpController {
  constructor(private readonly totpService: TotpService) {}

  @Post('accounts')
  @ApiOperation({ summary: 'Add an authenticator account (otpauth:// URI or raw secret)' })
  create(@Body() dto: CreateTotpAccountDto) {
    return this.totpService.create(dto);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'List accounts (secrets are never returned)' })
  findAll() {
    return this.totpService.findAll();
  }

  @Delete('accounts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an account' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.totpService.remove(id);
  }

  @Get('codes')
  @ApiOperation({ summary: 'Current codes for all accounts' })
  codes() {
    return this.totpService.codes();
  }

  @Get('codes/:id')
  @ApiOperation({ summary: 'Current code for one account' })
  code(@Param('id', ParseUUIDPipe) id: string) {
    return this.totpService.code(id);
  }
}
