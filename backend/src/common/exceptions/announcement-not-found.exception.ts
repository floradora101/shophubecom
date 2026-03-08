import { NotFoundException } from '@nestjs/common';

export class AnnouncementNotFoundException extends NotFoundException {
  constructor(message = 'Announcement not found') {
    super(message);
  }
}
