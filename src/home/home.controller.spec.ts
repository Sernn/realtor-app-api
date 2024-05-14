import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PrismaService } from '../prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

const mockUser = {
  id: 55,
  name: 'thisisfortest',
  email: 'fortestonly@test.test',
  phone: '888 888 8888',
};

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

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: {
            getHomes: jest.fn().mockReturnValue([]),
            getRealtorByHomeId: jest.fn().mockReturnValue(mockUser),
            updateHomeById: jest.fn().mockReturnValue(mockHome),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHomes', () => {
    it('should construct filter object correctly', async () => {
      const mockGetHomes = jest.fn().mockReturnValue([]);
      jest.spyOn(homeService, 'getHomes').mockImplementation(mockGetHomes);
      await controller.getHomes('Toronto', '1500000');

      expect(mockGetHomes).toHaveBeenCalledWith({
        city: 'Toronto',
        price: {
          gte: 1500000,
        },
      });
    });
  });

  describe('updateHome', () => {
    const mockUserInfo = {
      name: 'test',
      id: 40,
      iat: 1,
      exp: 2,
    };

    const mockCreateHomeParams = {
      address: '111 red street',
      numberOfBathrooms: 2,
      numberOfBedrooms: 3,
      city: 'BKK',
      landSize: 500,
      price: 3000000,
      propertyType: PropertyType.CONDO,
    };

    it('should throw unauth error if realtor didnt create home', async () => {
      await expect(
        controller.updateHome(5, mockCreateHomeParams, mockUserInfo),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update home if realtor id is valid', async () => {
      const mockUpdateHome = jest.fn().mockReturnValue(mockHome);

      jest
        .spyOn(homeService, 'updateHomeById')
        .mockImplementation(mockUpdateHome);

      await controller.updateHome(5, mockCreateHomeParams, {
        ...mockUserInfo,
        id: 55,
      });
      expect(mockUpdateHome).toHaveBeenCalled();
    });
  });
});
