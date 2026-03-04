import { AnnouncementIconType } from '@prisma/client';

export class AnnouncementResponseDto {
  id!: string;
  text!: string;
  highlight!: string;
  icon!: AnnouncementIconType;
  isActive!: boolean;
  priority!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
