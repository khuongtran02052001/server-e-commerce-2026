import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PaginateOptionsDTO } from '../../../common/dto/paginate-options.dto';

export class SearchProductsQueryDTO extends PaginateOptionsDTO {
  @ApiProperty({
    required: false,
  })
  @IsString()
  search: string;
}
