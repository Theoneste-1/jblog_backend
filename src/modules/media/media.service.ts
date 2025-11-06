import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './entities/media.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) {}

  async create(
    file: Express.Multer.File,
    user: User,
    altText?: string,
  ): Promise<Media> {
    const media = this.mediaRepository.create({
      filename: file.originalname,
      url: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      altText,
      uploadedBy: user,
    });

    return this.mediaRepository.save(media);
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<[Media[], number]> {
    return this.mediaRepository.findAndCount({
      relations: ['uploadedBy'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Media> {
    const media = await this.mediaRepository.findOne({
      where: { id },
      relations: ['uploadedBy'],
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return media;
  }

  async remove(id: string): Promise<void> {
    const result = await this.mediaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Media not found');
    }
  }
}
