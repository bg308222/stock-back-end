import { ApiProperty } from '@nestjs/swagger';

export class IAvailableQuery {
  @ApiProperty({ enum: ['order', 'display', 'transaction'], required: true })
  type: 'order' | 'display' | 'transaction';
}
