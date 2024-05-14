import { Test, TestingModule } from '@nestjs/testing';
import { HomeService, homeSelect } from './home.service';
import { PrismaService } from '../prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

const mockGetHomes = [
  {
    id: 2,
    address: '1111 happy Road',
    city: 'test update city',
    price: 400000,
    propertyType: PropertyType.RESIDENTIAL,
    image: 'img10',
    numberOfBedRooms: 4,
    numberOfBathrooms: 5,
    images: [
      {
        url: 'src1',
      },
    ],
  },
];

const mockHome = {
  id: 2,
  address: '1111 happy Road',
  city: 'test update city',
  price: 400000,
  propertyType: PropertyType.RESIDENTIAL,
  image: 'img10',
  numberOfBedRooms: 4,
  numberOfBathrooms: 5,
};

const mockImages = [
  {
    id: 1,
    url: 'src1',
  },
  {
    id: 2,
    url: 'src2',
  },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
              create: jest.fn().mockReturnValue(mockHome),
            },
            image: {
              createMany: jest.fn().mockReturnValue(mockImages),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Toronto',
      price: {
        gte: 1000000,
        lte: 1500000,
      },
      PropertyType: PropertyType.RESIDENTIAL,
    };
    it('should call prisma home.findMany with correct params', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);
      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);
      await service.getHomes(filters);
      expect(mockPrismaFindManyHomes).toHaveBeenCalledWith({
        select: {
          ...homeSelect,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
        // performing filter inside where
        where: filters,
      });
    });

    it('should throw not found exception if not homes are found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);
      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomes(filters)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createHome', () => {
    const mockCreateHomeParams = {
      address: '111 red street',
      numberOfBathrooms: 2,
      numberOfBedrooms: 3,
      city: 'BKK',
      landSize: 500,
      price: 3000000,
      propertyType: PropertyType.CONDO,
      images: [
        {
          url: 'src1',
        },
      ],
    };

    it('should call prisma.home.create with the correct payload', async () => {
      const mockCreateHome = jest.fn().mockReturnValue(mockHome);

      jest
        .spyOn(prismaService.home, 'create')
        .mockImplementation(mockCreateHome);

      await service.createHome(mockCreateHomeParams, 5);

      expect(mockCreateHome).toHaveBeenCalledWith({
        data: {
          address: '111 red street',
          number_of_bathrooms: 2,
          number_of_bedrooms: 3,
          city: 'BKK',
          land_size: 500,
          price: 3000000,
          propertyType: PropertyType.CONDO,
          realtor_id: 5,
        },
      });
    });

    it('should call prisma image.createMany with the correct payload', async () => {
      const mockCreateManyImage = jest.fn().mockReturnValue(mockImages);

      jest
        .spyOn(prismaService.image, 'createMany')
        .mockImplementation(mockCreateManyImage);

      await service.createHome(mockCreateHomeParams, 5);

      expect(mockCreateManyImage).toHaveBeenCalledWith({
        data: [
          {
            url: 'src1',
            home_id: 2,
          },
        ],
      });
    });
  });
});
