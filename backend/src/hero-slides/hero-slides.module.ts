import { Module } from '@nestjs/common';
import { HeroSlidesService } from './hero-slides.service';
import { HeroSlidesController } from './hero-slides.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HeroSlidesController],
  providers: [HeroSlidesService],
  exports: [HeroSlidesService],
})
export class HeroSlidesModule {}
