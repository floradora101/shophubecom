import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { UserResponseDto, UpdateProfileDto, ChangePasswordDto } from './dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: AuthenticatedUser): UserResponseDto {
    // Return user as UserResponseDto for API response
    return user as UserResponseDto;
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  /**
   * @route POST /api/users/change-password
   * @description Changes the password for the current authenticated user
   * @param user - Current authenticated user (injected by JwtAuthGuard)
   * @param changePasswordDto - Contains current password and new password
   * @returns Success message
   * @throws InvalidCredentialsException if current password is incorrect
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.usersService.changePassword(user.id, changePasswordDto);
    return {
      success: true,
      message: 'Password changed successfully',
    };
  }
}
