// user-service/src/user/dto/user-response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({ example: 'a1b2c3d4-uuid-user-id' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @Expose()
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @Expose()
  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  avatar?: string;

  @Expose()
  @ApiProperty({ example: '+66123456789', required: false })
  phoneNumber?: string;

  @Expose()
  @ApiProperty({ example: '123 Main St, Bangkok', required: false })
  address?: string;

  @Expose()
  @ApiProperty({ example: 'USER', enum: ['USER', 'STAFF', 'ADMIN'] })
  role: string;

  @Expose()
  @ApiProperty({ example: '2024-06-01T12:00:00.000Z' })
  createdAt: Date;
}
