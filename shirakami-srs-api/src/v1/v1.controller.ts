import { Controller, Get } from '@nestjs/common';

@Controller()
export class V1Controller {
  @Get()
  getApiInfo() {
    return {
      apiName: 'ShiraKami SRS',
      version: '1.0.0',
    };
  }
}
